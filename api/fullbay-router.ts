import { z } from "zod";
import { eq, like } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { parts } from "@db/schema";
import { getInventoryAdjustments, pingFullbay, getDetectedIp } from "./fullbay-service";

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
    try {
      const ok = await pingFullbay();
      return { connected: ok };
    } catch (e: any) {
      return { connected: false, error: e.message };
    }
  }),

  syncInventory: adminQuery
    .input(z.object({ daysBack: z.number().min(1).max(365).optional() }).optional())
    .mutation(async ({ input }) => {
      const db = getDb();
      const days = input?.daysBack ?? 30;
      const adjustments = await getInventoryAdjustments(days);

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

      return { created, updated, skipped, errors: errors.length, total: adjustments.length };
    }),
});
