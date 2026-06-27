/**
 * Fullbay Inventory Sync Service
 * Env vars: FULLBAY_API_KEY
 */

import { createHash } from "crypto";

const API_KEY = () => {
  const key = process.env.FULLBAY_API_KEY;
  if (!key) throw new Error("FULLBAY_API_KEY not set");
  return key;
};

let cachedServerIp: string | null = null;

async function getServerIp(): Promise<string> {
  if (cachedServerIp) return cachedServerIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    cachedServerIp = data.ip;
    return data.ip;
  } catch {
    try {
      const res = await fetch("https://ipinfo.io/json", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      cachedServerIp = data.ip;
      return data.ip;
    } catch (e: any) {
      throw new Error("Cannot detect server IP: " + e.message);
    }
  }
}

function generateToken(ip: string): string {
  const key = API_KEY();
  const today = new Date().toISOString().split("T")[0];
  const hashInput = `${key}${today}${ip}`;
  return createHash("sha1").update(hashInput).digest("hex");
}

export async function fb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const ip = await getServerIp();
  const url = new URL(`https://app.fullbay.com/services/${endpoint}`);
  url.searchParams.set("key", API_KEY());
  url.searchParams.set("token", generateToken(ip));
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  console.log("[FULLBAY] >>> URL:", url.toString().replace(API_KEY(), "***"));

  const res = await fetch(url.toString(), { method: "GET" });
  const text = await res.text();
  console.log("[FULLBAY] <<< Raw:", text.substring(0, 300));

  try {
    const json = JSON.parse(text);
    return json;
  } catch {
    throw new Error("Invalid JSON: " + text.substring(0, 200));
  }
}

export interface FbAdjustment {
  PartNumber: string;
  PartName: string;
  QtyChanged: number;
  NewOnHand: number;
  Reason: string;
  Date: string;
  Location: string;
}

export async function getInventoryAdjustments(daysBack = 365): Promise<FbAdjustment[]> {
  const all: FbAdjustment[] = [];
  const now = new Date();
  const msDay = 86400000;
  let chunkEnd = now;
  let remaining = daysBack;
  let chunkNum = 0;

  console.log(`[FULLBAY] Starting sync for ${daysBack} days`);

  while (remaining > 0) {
    const size = Math.min(remaining, 7);
    const chunkStart = new Date(chunkEnd.getTime() - size * msDay);
    const s = chunkStart.toISOString().split("T")[0];
    const e = chunkEnd.toISOString().split("T")[0];

    console.log(`[FULLBAY] Chunk ${++chunkNum}: ${s} to ${e}`);

    const json = await fb("getAdjustments.php", { startDate: s, endDate: e });
    console.log(`[FULLBAY] Chunk ${chunkNum} keys:`, Object.keys(json));

    // FIX: Fullbay uses "resultSet" not "Data"
    const items = json.resultSet || json.Data || [];
    if (items.length > 0) {
      all.push(...items);
      console.log(`[FULLBAY] Chunk ${chunkNum} items:`, items.length);
      if (items[0]) console.log(`[FULLBAY] First item keys:`, Object.keys(items[0]));
    } else {
      console.log(`[FULLBAY] Chunk ${chunkNum}: empty`);
    }

    chunkEnd = new Date(chunkStart.getTime() - msDay);
    remaining -= size;
  }

  console.log(`[FULLBAY] Total items:`, all.length);
  return all;
}
export async function pingFullbay(): Promise<{ ok: boolean; error?: string }> {
  try {
    const json = await fb("getAdjustments.php", { startDate: "2024-01-01", endDate: "2024-01-02" });
    if (json.status === "FAIL") return { ok: false, error: json.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function getDetectedIp(): Promise<string> {
  return getServerIp();
}
