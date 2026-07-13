import { z } from "zod";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems } from "@db/schema";

// List orders with pagination and filters (admin only)
const listOrders = adminQuery
  .input(
    z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.string().optional(),
      paymentMethod: z.string().optional(),
      fulfillment: z.string().optional(),
      search: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const db = getDb();
    const page = input?.page ?? 1;
    const limit = input?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (input?.status) conditions.push(eq(orders.paymentStatus, input.status as any));
    if (input?.paymentMethod) conditions.push(eq(orders.paymentMethod, input.paymentMethod as any));
    if (input?.fulfillment) conditions.push(eq(orders.fulfillmentStatus, input.fulfillment as any));
    if (input?.search) {
      const search = `%${input.search}%`;
      conditions.push(sql`${orders.orderNumber} LIKE ${search} OR ${orders.customerName} LIKE ${search} OR ${orders.customerEmail} LIKE ${search}`);
    }
    if (input?.dateFrom) conditions.push(gte(orders.createdAt, new Date(input.dateFrom)));
    if (input?.dateTo) conditions.push(lte(orders.createdAt, new Date(input.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(where),
    ]);

    // Get items for each order
    const ordersWithItems = await Promise.all(
      data.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return {
      orders: ordersWithItems,
      total: countResult[0]?.count ?? 0,
      page,
      totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
    };
  });

// Get single order with items
const getOrder = adminQuery
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
    if (!order) throw new Error("Order not found");
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return { ...order, items };
  });

// Create order (called from checkout)
const createOrder = publicQuery
  .input(
    z.object({
      orderNumber: z.string(),
      customerName: z.string().min(1),
      customerEmail: z.string().email(),
      customerPhone: z.string().optional(),
      shippingAddress: z.string().optional(),
      billingAddress: z.string().optional(),
      subtotal: z.string(),
      tax: z.string().default("0"),
      shipping: z.string().default("0"),
      total: z.string(),
      paymentMethod: z.enum(["stripe", "paypal", "bank_transfer", "cash_on_pickup"]),
      paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
      stripeSessionId: z.string().optional(),
      stripePaymentIntentId: z.string().optional(),
      paypalOrderId: z.string().optional(),
      deliveryType: z.enum(["pickup", "delivery", "shipping"]).default("pickup"),
      notes: z.string().optional(),
      ipAddress: z.string().optional(),
      fraudScore: z.number().optional(),
      fraudFlags: z.string().optional(),
      items: z.array(z.object({
        partId: z.number(),
        partName: z.string(),
        partSku: z.string(),
        partImage: z.string().optional(),
        quantity: z.number().min(1),
        unitPrice: z.string(),
        totalPrice: z.string(),
      })),
    })
  )
  .mutation(async ({ input }) => {
    const db = getDb();

    // Insert order
    const [order] = await db.insert(orders).values({
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      subtotal: input.subtotal,
      tax: input.tax,
      shipping: input.shipping,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      paypalOrderId: input.paypalOrderId,
      deliveryType: input.deliveryType,
      notes: input.notes,
      ipAddress: input.ipAddress,
      fraudScore: input.fraudScore ?? 0,
      fraudFlags: input.fraudFlags,
    });

    const orderId = order.insertId;

    // Insert order items
    for (const item of input.items) {
      await db.insert(orderItems).values({
        orderId: Number(orderId),
        partId: item.partId,
        partName: item.partName,
        partSku: item.partSku,
        partImage: item.partImage,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    }

    // TODO: Send notification email to admin
    console.log(`[ORDER] New order #${input.orderNumber} - ${input.customerEmail} - $${input.total}`);

    return { orderId: Number(orderId), orderNumber: input.orderNumber };
  });

// Update order status
const updateOrder = adminQuery
  .input(
    z.object({
      id: z.number(),
      paymentStatus: z.enum(["pending", "paid", "failed", "refunded", "disputed"]).optional(),
      fulfillmentStatus: z.enum(["pending", "picked", "packed", "shipped", "delivered", "ready_for_pickup", "picked_up"]).optional(),
      trackingNumber: z.string().optional(),
      adminNotes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...updates } = input;
    await db.update(orders).set(updates).where(eq(orders.id, id));
    return { ok: true };
  });

// Update order after successful Stripe payment
const markOrderPaid = publicQuery
  .input(
    z.object({
      stripeSessionId: z.string(),
      stripePaymentIntentId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const db = getDb();
    await db.update(orders)
      .set({
        paymentStatus: "paid",
        stripePaymentIntentId: input.stripePaymentIntentId,
        fulfillmentStatus: "pending",
      })
      .where(eq(orders.stripeSessionId, input.stripeSessionId));
    return { ok: true };
  });

// Stats for admin dashboard
const getStats = adminQuery.query(async () => {
  const db = getDb();

  const [totalOrders, todayOrders, revenue, pendingOrders] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(orders),
    db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(gte(orders.createdAt, new Date(Date.now() - 86400000))),
    db.select({ total: sql<string>`COALESCE(SUM(CAST(${orders.total} AS DECIMAL(10,2))), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.fulfillmentStatus, "pending")),
  ]);

  return {
    totalOrders: totalOrders[0]?.count ?? 0,
    todayOrders: todayOrders[0]?.count ?? 0,
    totalRevenue: revenue[0]?.total ?? "0",
    pendingOrders: pendingOrders[0]?.count ?? 0,
  };
});

export const ordersRouter = createRouter({
  list: listOrders,
  get: getOrder,
  create: createOrder,
  update: updateOrder,
  markPaid: markOrderPaid,
  stats: getStats,
});
