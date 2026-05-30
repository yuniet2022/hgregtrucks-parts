import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { getDb, initDb } from "./queries/connection";
import { parts } from "@db/schema";
import { count } from "drizzle-orm";
import { createConnection } from "mysql2/promise";
import { seedDefaultAdmin } from "./local-auth-router";

const app = new Hono<{ Bindings: HttpBindings }>();

// CORS — allow all origins for API access
app.use("/api/*", cors({
  origin: ["https://hgregtrucksparts.com", "https://ut3dunnojtxyy.kimi.page", "http://localhost:5173"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
  maxAge: 86400,
}));

// Body limit — must be BEFORE upload routes (50MB max)
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Ultra-fast health check for Railway
app.get("/health", (c) => c.status(200));

// Cloudinary upload — reads credentials from Railway env vars
app.post("/api/cloudinary-upload", async (c) => {
  try {
    const { v2: cloudinary } = await import("cloudinary");
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (cloudinaryUrl) {
      cloudinary.config({ cloudinary_url: cloudinaryUrl });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dgq68oxd5",
        api_key: process.env.CLOUDINARY_API_KEY || "314859656465958",
        api_secret: process.env.CLOUDINARY_API_SECRET || "BhyglGNzhWZFC_M000f-rOZTl4I",
        secure: true,
      });
    }

    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || !(file instanceof File)) {
      return c.json({ ok: false, error: "No file" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "hgreg_parts", overwrite: true, resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return c.json({ ok: true, url: result.secure_url });
  } catch (e: any) {
    console.error("[cloudinary] Upload error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// OAuth callback
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// Auto-setup: creates tables and seeds data on first run
app.get("/api/setup", async (c) => {
  try {
    // Use raw mysql2 to create table (Drizzle planetscale mode doesn't support DDL)
    const dbUrl = env.databaseUrl;
    if (!dbUrl) {
      return c.json({ ok: false, error: "DATABASE_URL not configured" }, 500);
    }

    // Parse DATABASE_URL for mysql2
    const url = new URL(dbUrl);
    const conn = await createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });

    // Create tables with raw mysql2
    await conn.execute(`CREATE TABLE IF NOT EXISTS parts (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL UNIQUE,
      price VARCHAR(20) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      category VARCHAR(50) NOT NULL,
      make VARCHAR(50) NOT NULL,
      model VARCHAR(50) NOT NULL,
      yearFrom INT NOT NULL DEFAULT 0,
      yearTo INT NOT NULL DEFAULT 0,
      description TEXT,
      image VARCHAR(500) NOT NULL,
      image2 VARCHAR(500),
      image3 VARCHAR(500),
      image4 VARCHAR(500),
      oemNumber VARCHAR(100) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    // Create admins table (with role column)
    await conn.execute(`CREATE TABLE IF NOT EXISTS admins (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      role ENUM('admin','manager') NOT NULL DEFAULT 'manager',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    // If table existed without role column, add it
    try {
      await conn.execute(`ALTER TABLE admins ADD COLUMN role ENUM('admin','manager') NOT NULL DEFAULT 'manager'`);
    } catch { /* column may already exist */ }

    // Create messages table
    await conn.execute(`CREATE TABLE IF NOT EXISTS messages (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(320) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      status ENUM('new','answered') NOT NULL DEFAULT 'new',
      response TEXT,
      respondedBy VARCHAR(100),
      respondedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);

    await conn.end();

    // Add image columns if table already exists without them
    const conn2 = await createConnection({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN image2 VARCHAR(500)`); } catch { /* exists */ }
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN image3 VARCHAR(500)`); } catch { /* exists */ }
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN image4 VARCHAR(500)`); } catch { /* exists */ }
    // Add fulfillment columns (pickup, deliver, ship) - defaults to true (1)
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN pickup TINYINT(1) NOT NULL DEFAULT 1`); } catch { /* exists */ }
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN deliver TINYINT(1) NOT NULL DEFAULT 1`); } catch { /* exists */ }
    try { await conn2.execute(`ALTER TABLE parts ADD COLUMN ship TINYINT(1) NOT NULL DEFAULT 1`); } catch { /* exists */ }
    await conn2.end();

    // Use Drizzle for queries
    const db = getDb();

    // Check if parts table has data
    const result = await db.select({ value: count() }).from(parts);
    const existingCount = result[0]?.value ?? 0;

    if (existingCount > 0) {
      return c.json({ ok: true, message: `Database already seeded with ${existingCount} parts.` });
    }

    // Insert seed data
    const defaults = [
      { name: "Cummins ISX15 Turbocharger", sku: "HGP-ISX15-TBO", price: "1245.00", stock: 12, category: "Engine", make: "Kenworth", model: "T680", yearFrom: 2015, yearTo: 2024, description: "Genuine Cummins turbocharger for ISX15 engines. OEM quality replacement.", image: "/product-turbo.jpg", oemNumber: "288210500", brand: "Cummins" },
      { name: "Detroit DD15 Fuel Injector Set", sku: "HGP-DD15-FIS", price: "890.00", stock: 8, category: "Engine", make: "Freightliner", model: "Cascadia", yearFrom: 2012, yearTo: 2024, description: "Complete set of 6 remanufactured fuel injectors for DD15 engines.", image: "/product-brake.jpg", oemNumber: "A4720700287", brand: "Detroit Diesel" },
      { name: "PACCAR MX-13 Oil Pump", sku: "HGP-MX13-OPM", price: "340.00", stock: 24, category: "Engine", make: "Peterbilt", model: "579", yearFrom: 2014, yearTo: 2024, description: "High-volume oil pump for PACCAR MX-13 engines. Direct fit replacement.", image: "/product-turbo.jpg", oemNumber: "2109876PE", brand: "PACCAR" },
      { name: "Kenworth T680 LED Headlight Pair", sku: "HGP-T680-LED", price: "285.00", stock: 18, category: "Lighting", make: "Kenworth", model: "T680", yearFrom: 2013, yearTo: 2024, description: "DOT approved LED headlight assembly pair for Kenworth T680.", image: "/product-brake.jpg", oemNumber: "M10130", brand: "Truck-Lite" },
      { name: "Freightliner Cascadia Air Dryer", sku: "HGP-CAD-ADR", price: "195.00", stock: 31, category: "Air System", make: "Freightliner", model: "Cascadia", yearFrom: 2008, yearTo: 2024, description: "Air dryer cartridge and assembly for Freightliner air brake systems.", image: "/product-turbo.jpg", oemNumber: "4324130010", brand: "WABCO" },
      { name: "Volvo D13 EGR Valve", sku: "HGP-D13-EGR", price: "520.00", stock: 6, category: "Emissions", make: "Volvo", model: "VNL 860", yearFrom: 2015, yearTo: 2024, description: "EGR valve assembly for Volvo D13 engines. Includes gaskets.", image: "/product-brake.jpg", oemNumber: "21870635", brand: "Volvo" },
      { name: "Peterbilt 579 Chrome Bumper", sku: "HGP-579-CBM", price: "1850.00", stock: 4, category: "Body", make: "Peterbilt", model: "579", yearFrom: 2012, yearTo: 2024, description: "Show-quality chrome bumper with integrated fog light mounts.", image: "/product-turbo.jpg", oemNumber: "M55105-1", brand: "RoadWorks" },
      { name: "Mack MP8 Water Pump", sku: "HGP-MP8-WPM", price: "265.00", stock: 15, category: "Cooling", make: "Mack", model: "Anthem", yearFrom: 2018, yearTo: 2024, description: "Heavy-duty water pump for Mack MP8 engines with serpentine pulley.", image: "/product-brake.jpg", oemNumber: "21021700", brand: "Mack" },
      { name: "Kenworth T800 Air Spring", sku: "HGP-T800-ASP", price: "145.00", stock: 42, category: "Suspension", make: "Kenworth", model: "T800", yearFrom: 2005, yearTo: 2024, description: "Rear air spring bellows for Kenworth T800 suspension systems.", image: "/product-turbo.jpg", oemNumber: "W01-358-9949", brand: "Firestone" },
      { name: "International LT Brake Chamber", sku: "HGP-LT-BRC", price: "95.00", stock: 27, category: "Brake", make: "International", model: "LT Series", yearFrom: 2017, yearTo: 2024, description: "Type 30/30 brake chamber for International LT Series trucks.", image: "/product-brake.jpg", oemNumber: "GC3030LCW", brand: "Gunite" },
      { name: "Western Star 49X Fifth Wheel", sku: "HGP-49X-FWH", price: "785.00", stock: 9, category: "Chassis", make: "Western Star", model: "49X", yearFrom: 2020, yearTo: 2024, description: "Heavy-duty fifth wheel plate for Western Star 49X with release handle.", image: "/product-turbo.jpg", oemNumber: "FW3500", brand: "Fontaine" },
      { name: "Isuzu NPR Starter Motor", sku: "HGP-NPR-STR", price: "175.00", stock: 20, category: "Electrical", make: "Isuzu", model: "NPR-HD", yearFrom: 2011, yearTo: 2024, description: "12V starter motor for Isuzu NPR-HD diesel engines.", image: "/product-brake.jpg", oemNumber: "8-98070-321-0", brand: "Isuzu" },
    ];

    await db.insert(parts).values(defaults);
    return c.json({ ok: true, seeded: defaults.length });
  } catch (e: any) {
    return c.json({ ok: false, error: e.message }, 500);
  }
});

// tRPC API
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// 404 for API routes
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  // Initialize DB pool eagerly at startup
  try {
    initDb();
    console.log("[DB] Pool initialized at startup");
    await seedDefaultAdmin();
  } catch (e: any) {
    console.error("[DB] Failed to initialize pool at startup:", e.message);
  }

  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "8080");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[API] Server running on http://localhost:${port}/`);
  });
}
