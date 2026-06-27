import { z } from "zod";
import { eq, like } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { parts } from "@db/schema";
import { getInventoryAdjustments, pingFullbay, getDetectedIp } from "./fullbay-service";
// FORCE REBUILD v2 - timestamp: 2025-06-27
export const fullbayRouter = createRouter({
  myIp: publicQuery.query(async () => {
    try {
      const ip = await getDetectedIp();
      return { ip, auto: true };
    } catch (e: any) {
      return { ip: "unknown", auto: false, error: e.message };
    }
  }),

    ping: adminQuery.query(async () => {
    const result = await pingFullbay();
    return { connected: result.ok, error: result.error || null };
  }),

   debug: adminQuery.query(async () => {
    try {
      const { getInventoryAdjustments } = await import("./fullbay-service");
      const adjustments = await getInventoryAdjustments(7); // Solo 7 días = 1 chunk
      return { 
        ok: true, 
        count: adjustments.length,
        firstItem: adjustments.length > 0 ? adjustments[0] : null,
        fieldNames: adjustments.length > 0 ? Object.keys(adjustments[0]) : []
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }),
  syncInventory: adminQuery
    .input(z.object({ daysBack: z.number().min(1).max(365).optional() }).optional())
    .mutation(async ({ input }) => {
      const db = getDb();
      const days = input?.daysBack ?? 365;

      let adjustments;
      try {
        adjustments = await getInventoryAdjustments(days);
      } catch (e: any) {
        return { created: 0, updated: 0, skipped: 0, errors: 1, total: 0, error: e.message };
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const adj of adjustments) {
        try {
          if (!adj.PartNumber || !adj.PartName) { skipped++; continue; }

          const existing = await db
            .select()
            .from(parts)
            .where(eq(parts.sku, adj.PartNumber));

          if (existing.length > 0) {
            await db
              .update(parts)
              .set({ stock: adj.NewOnHand })
              .where(eq(parts.id, existing[0].id));
            updated++;
          } else {
            await db.insert(parts).values({
              name: adj.PartName,
              sku: adj.PartNumber,
              price: "0",
              stock: adj.NewOnHand,
              category: "General",
              make: "Universal",
              model: "All",
              yearFrom: 1990,
              yearTo: 2026,
              description: `Imported from Fullbay.`,
              image: "/no-photo.png",
              oemNumber: adj.PartNumber,
              brand: "",
              pickup: 1,
              deliver: 1,
              ship: 1,
              source: "fullbay",
            });
            created++;
          }
        } catch (e: any) {
          errors.push(`${adj.PartNumber}: ${e.message}`);
        }
      }

      return { created, updated, skipped, errors: errors.length, total: adjustments.length, error: errors.length > 0 ? errors[0] : null };
    }),
});
