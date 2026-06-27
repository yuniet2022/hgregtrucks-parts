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

async function fb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const ip = await getServerIp();
  const url = new URL(`https://app.fullbay.com/services/${endpoint}`);
  url.searchParams.set("key", API_KEY());
  url.searchParams.set("token", generateToken(ip));
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { method: "GET" });
  const text = await res.text();
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

/**
 * Fetch adjustments in 7-day chunks (Fullbay API limit).
 * Combines results from multiple requests.
 */
export async function getInventoryAdjustments(daysBack = 365): Promise<FbAdjustment[]> {
  const allAdjustments: FbAdjustment[] = [];
  const now = new Date();
  const msPerDay = 86400000;
  let chunkEnd = now;
  let daysRemaining = daysBack;

  while (daysRemaining > 0) {
    const chunkSize = Math.min(daysRemaining, 7);
    const chunkStart = new Date(chunkEnd.getTime() - chunkSize * msPerDay);

    const startStr = chunkStart.toISOString().split("T")[0];
    const endStr = chunkEnd.toISOString().split("T")[0];

    const json = await fb("getAdjustments.php", { startDate: startStr, endDate: endStr });

    if (json.status === "SUCCESS" && json.Data) {
      allAdjustments.push(...json.Data);
    }

    chunkEnd = new Date(chunkStart.getTime() - msPerDay);
    daysRemaining -= chunkSize;
  }

  return allAdjustments;
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
