import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any;

export function initDb() {
  if (!instance) {
    console.log("[DB] Initializing MySQL pool...");
    const pool = createPool({
      uri: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 10000,
    });
    instance = drizzle(pool, { schema: fullSchema, mode: "default" });
    console.log("[DB] MySQL pool initialized (2 connections)");
  }
  return instance;
}

export function getDb() {
  if (!instance) {
    return initDb();
  }
  return instance;
}
