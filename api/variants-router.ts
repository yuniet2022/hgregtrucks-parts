import { z } from "zod";
import { eq } from "drizzle-orm";
import { partVariants } from "@db/schema";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";

export const variantsRouter = createRouter({
  listByPart: publicQuery
    .input(z.object({ partId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, input.partId));
    }),

  create: adminQuery
    .input(z.object({
      partId: z.number(),
      variantName: z.string().min(1),
      price: z.string().min(1),
      stock: z.number().min(0),
      sku: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(partVariants).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: adminQuery
    .input(z.object({
      id: z.number(),
      variantName: z.string().min(1).optional(),
      price: z.string().min(1).optional(),
      stock: z.number().min(0).optional(),
      sku: z.string().min(1).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const db = getDb();
      await db.update(partVariants).set(updates).where(eq(partVariants.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(partVariants).where(eq(partVariants.id, input.id));
      return { success: true };
    }),

  batchUpdate: adminQuery
    .input(z.object({
      partId: z.number(),
      variants: z.array(z.object({
        id: z.number().optional(),
        variantName: z.string().min(1),
        price: z.string().min(1),
        stock: z.number().min(0),
        sku: z.string().min(1),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(partVariants).where(eq(partVariants.partId, input.partId));
      if (input.variants.length > 0) {
        await db.insert(partVariants).values(
          input.variants.map((v) => ({
            partId: input.partId,
            variantName: v.variantName,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
          }))
        );
      }
      return { success: true };
    }),
});
