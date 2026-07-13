import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  // bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
export const parts = mysqlTable("parts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  price: varchar("price", { length: 20 }).notNull(),
  stock: serial("stock"),
  category: varchar("category", { length: 50 }).notNull(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 50 }).notNull(),
  yearFrom: serial("yearFrom"),
  yearTo: serial("yearTo"),
  description: text("description"),
  image: varchar("image", { length: 500 }).notNull(),
  image2: varchar("image2", { length: 500 }),
  image3: varchar("image3", { length: 500 }),
  image4: varchar("image4", { length: 500 }),
  oemNumber: varchar("oemNumber", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  pickup: int("pickup", { unsigned: true }).default(1).notNull(),
  deliver: int("deliver", { unsigned: true }).default(1).notNull(),
  ship: int("ship", { unsigned: true }).default(1).notNull(),
  coreCharge: varchar("coreCharge", { length: 20 }).default("0"),
  coreRebate: varchar("coreRebate", { length: 20 }).default("0"),
  source: varchar("source", { length: 20 }).default("manual"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Part = typeof parts.$inferSelect;
export type InsertPart = typeof parts.$inferInsert;

export const admins = mysqlTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "manager"]).default("manager").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;

export const partVariants = mysqlTable("part_variants", {
  id: serial("id").primaryKey(),
  partId: int("partId", { unsigned: true }).notNull(),
  variantName: varchar("variantName", { length: 100 }).notNull(),
  price: varchar("price", { length: 20 }).notNull(),
  stock: int("stock", { unsigned: true }).default(0).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["new", "answered"]).default("new").notNull(),
  response: text("response"),
  respondedBy: varchar("respondedBy", { length: 100 }),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ===== ORDERS (Purchase History) =====
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  shippingAddress: text("shippingAddress"),
  subtotal: varchar("subtotal", { length: 20 }).notNull(),
  tax: varchar("tax", { length: 20 }).default("0").notNull(),
  shipping: varchar("shipping", { length: 20 }).default("0").notNull(),
  total: varchar("total", { length: 20 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "paypal", "bank_transfer", "cash_on_pickup"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded", "disputed"]).default("pending").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 100 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  paypalOrderId: varchar("paypalOrderId", { length: 100 }),
  fulfillmentStatus: mysqlEnum("fulfillmentStatus", ["pending", "picked", "packed", "shipped", "delivered", "ready_for_pickup", "picked_up"]).default("pending").notNull(),
  deliveryType: mysqlEnum("deliveryType", ["pickup", "delivery", "shipping"]).default("pickup").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  fraudScore: int("fraudScore", { unsigned: true }).default(0),
  fraudFlags: text("fraudFlags"),
  // Anti-fraud data
  ipAddress: varchar("ipAddress", { length: 50 }),
  billingAddress: text("billingAddress"),
  cardCountry: varchar("cardCountry", { length: 10 }),
  threeDSecure: mysqlEnum("threeDSecure", ["not_attempted", "attempted", "successful", "failed"]).default("not_attempted"),
  // Admin
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ===== ORDER ITEMS =====
export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: int("orderId", { unsigned: true }).notNull(),
  partId: int("partId", { unsigned: true }).notNull(),
  partName: varchar("partName", { length: 255 }).notNull(),
  partSku: varchar("partSku", { length: 100 }).notNull(),
  partImage: varchar("partImage", { length: 500 }),
  quantity: int("quantity", { unsigned: true }).notNull(),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  totalPrice: varchar("totalPrice", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;

// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
