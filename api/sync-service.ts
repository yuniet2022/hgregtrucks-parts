/**
 * Inventory Sync Service
 * Syncs stock levels between Fullbay (source of truth) and local DB
 * and sends online sales back to Fullbay as Counter Sales
 */

import { eq } from "drizzle-orm";
import { parts } from "@db/schema";
import { getDb } from "./queries/connection";
import { getAdjustments, createCounterSale } from "./fullbay-service";

// Track last sync timestamp
let lastSyncTime: string | null = null;

/**
 * Sync inventory FROM Fullbay TO local DB
 * Call this periodically (e.g., every 5 minutes via cron or on-demand)
 */
export async function syncInventoryFromFullbay(): Promise<{
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let updated = 0;

  try {
    const now = new Date().toISOString().split("T")[0];
    const startDate = lastSyncTime ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const adjustments = await getAdjustments({ startDate, endDate: now });

    const db = getDb();

    for (const adj of adjustments) {
      try {
        // Try to find the part by SKU/PartNumber
        const matching = await db
          .select()
          .from(parts)
          .where(eq(parts.sku, adj.PartNumber));

        if (matching.length > 0) {
          await db
            .update(parts)
            .set({ stock: adj.NewOnHand })
            .where(eq(parts.id, matching[0].id));
          updated++;
        }
      } catch (e: any) {
        errors.push(`Failed to update ${adj.PartNumber}: ${e.message}`);
      }
    }

    lastSyncTime = now;
  } catch (e: any) {
    errors.push(`Sync failed: ${e.message}`);
  }

  return { updated, errors };
}

/**
 * Send an online sale TO Fullbay as a Counter Sale
 * Call this after checkout is complete
 */
export async function syncSaleToFullbay(items: Array<{
  sku: string;
  name: string;
  qty: number;
  price: number;
}>): Promise<{ success: boolean; fullbayId?: number; error?: string }> {
  try {
    const result = await createCounterSale(
      items.map((i) => ({
        partNumber: i.sku,
        qty: i.qty,
        price: i.price,
      }))
    );
    return { success: true, fullbayId: result.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Manual trigger endpoint - can be called from admin panel
 */
export async function triggerFullSync(): Promise<string> {
  lastSyncTime = null; // Reset to force full sync
  const result = await syncInventoryFromFullbay();
  return `Updated ${result.updated} parts. Errors: ${result.errors.length}`;
}
