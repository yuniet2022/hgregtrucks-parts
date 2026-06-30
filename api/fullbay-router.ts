import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { parts } from "@db/schema";
import { getInventoryAdjustments, pingFullbay, getDetectedIp, fb, getSellingPrice, getMarginForCost } from "./fullbay-service";
import { categorizePart } from "./part-categorizer";

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
    return { connected: result.ok, error: result.error || null, marginRules: { low: "1.5 (<$10)", high: "1.3 (>=$10)" } };
  }),

  debugPart: publicQuery.query(async () => {
    const testPart = "FALKEN";
    const results: any = { testedPart: testPart };

    // Fechas: ultimos 7 dias
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const startStr = weekAgo.toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];

    // ========== getAdjustments.php ==========
    try {
      const adj = await fb("getAdjustments.php", { startDate: startStr, endDate: endStr });
      results.getAdjustments = {
        status: adj.status || "unknown",
        keys: Object.keys(adj),
        resultSetLength: adj.resultSet?.length || 0,
        // Primera parte encontrada con ese partNumber, o la primera en general
        matchingLine: (() => {
          if (!adj.resultSet) return null;
          for (const r of adj.resultSet) {
            for (const line of r.Lines || []) {
              if (line.partNumber === testPart) return line;
            }
          }
          // Si no hay match, devolver la primera linea
          return adj.resultSet[0]?.Lines?.[0] || null;
        })(),
        raw: adj,
      };
    } catch (e: any) { results.getAdjustments = { error: e.message }; }

    // ========== getCounterSales.php ==========
    try {
      const cs = await fb("getCounterSales.php", { startDate: startStr, endDate: endStr });
      results.getCounterSales = {
        status: cs.status || "unknown",
        keys: Object.keys(cs),
        resultSetLength: cs.resultSet?.length || 0,
        // Primera parte encontrada con ese partNumber, o la primera en general
        matchingLine: (() => {
          if (!cs.resultSet) return null;
          for (const r of cs.resultSet) {
            for (const line of r.Lines || r.parts || []) {
              if (line.partNumber === testPart) return line;
            }
          }
          // Buscar en otras estructuras posibles
          const first = cs.resultSet[0];
          if (first) {
            return first.Lines?.[0] || first.parts?.[0] || first.items?.[0] || first || null;
          }
          return null;
        })(),
        raw: cs,
      };
    } catch (e: any) { results.getCounterSales = { error: e.message }; }

    return results;
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

      for (const adj of adjustments) {
        try {
          if (!adj.PartNumber) { skipped++; continue; }

          const existing = await db.select().from(parts).where(eq(parts.sku, adj.PartNumber));

          if (existing.length > 0) {
            await db.update(parts).set({
              stock: adj.NewOnHand,
              price: existing[0].price === "0" || !existing[0].price ? getSellingPrice(adj.Cost) : existing[0].price,
              name: existing[0].name === "Unknown" || !existing[0].name ? adj.PartName : existing[0].name,
              description: existing[0].description === "Imported from Fullbay." || !existing[0].description ? adj.PartName : existing[0].description,
            }).where(eq(parts.id, existing[0].id));
            updated++;
          } else {
            await db.insert(parts).values({
              name: adj.PartName,
              sku: adj.PartNumber,
              price: getSellingPrice(adj.Cost),
              stock: adj.NewOnHand,
              category: categorizePart(adj.PartName) || "General",
              make: "Universal",
              model: "All",
              yearFrom: 1990,
              yearTo: 2026,
              description: adj.PartName,
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
          skipped++;
        }
      }

      return { created, updated, skipped, errors: 0, total: adjustments.length, error: null };
    }),
});
