/**
 * Fullbay Inventory Sync Service - DEBUG VERSION
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
    console.log("[FULLBAY] Detected server IP:", cachedServerIp);
    return data.ip;
  } catch {
    try {
      const res = await fetch("https://ipinfo.io/json", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      cachedServerIp = data.ip;
      console.log("[FULLBAY] Detected server IP (fallback):", cachedServerIp);
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
  const token = createHash("sha1").update(hashInput).digest("hex");
  console.log("[FULLBAY] Token input:", { keyPrefix: key.substring(0,8), today, ipPrefix: ip.substring(0,6), tokenPrefix: token.substring(0,8) });
  return token;
}

async function fb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const ip = await getServerIp();
  const url = new URL(`https://app.fullbay.com/services/${endpoint}`);
  url.searchParams.set("key", API_KEY());
  url.searchParams.set("token", generateToken(ip));
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  console.log("[FULLBAY] Request URL:", url.toString().replace(API_KEY(), "***KEY***"));

  const res = await fetch(url.toString(), { method: "GET" });
  const text = await res.text();
  console.log("[FULLBAY] Raw response (first 500 chars):", text.substring(0, 500));

  try {
    const json = JSON.parse(text);
    if (json.Error) throw new Error(json.Error);
    return json;
  } catch (e: any) {
    if (e.message.includes("JSON")) throw new Error("Invalid JSON response: " + text.substring(0, 200));
    throw e;
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
  console.log("[FULLBAY] Fetching adjustments, daysBack:", daysBack);
  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];
  console.log("[FULLBAY] Date range:", start, "to", end);

  const json = await fb("getAdjustments.php", { startDate: start, endDate: end });
  const data = (json.Data ?? []) as FbAdjustment[];
  console.log("[FULLBAY] Adjustments found:", data.length);
  return data;
}

export async function pingFullbay(): Promise<{ ok: boolean; error?: string }> {
  try {
    await fb("getAdjustments.php", { startDate: "2024-01-01", endDate: "2024-01-02" });
    return { ok: true };
  } catch (e: any) {
    console.error("[FULLBAY] Ping failed:", e.message);
    return { ok: false, error: e.message };
  }
}

export async function getDetectedIp(): Promise<string> {
  return getServerIp();
}
