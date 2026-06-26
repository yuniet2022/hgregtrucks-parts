/**
 * Fullbay Inventory Sync Service
 * Docs: https://gist.github.com/EpikaNick/38f2ac3ee83bd7f84f5f991ffb43e5a1
 *
 * Fullbay API uses SHA1 token authentication:
 *   token = sha1(key + todaysDate + ipAddress)
 *
 * Env vars:
 *   FULLBAY_API_KEY  - Your Fullbay API key
 */

import { createHash } from "crypto";

const API_KEY = () => {
  const key = process.env.FULLBAY_API_KEY;
  if (!key) throw new Error("FULLBAY_API_KEY not set");
  return key;
};

// Cache the server IP
let cachedServerIp: string | null = null;

/** Get the server's public IP automatically */
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
    } catch {
      throw new Error("Cannot determine server public IP.");
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
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.Error) throw new Error(json.Error);
  return json;
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

export async function getInventoryAdjustments(daysBack = 7): Promise<FbAdjustment[]> {
  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];
  const json = await fb("getAdjustments.php", { startDate: start, endDate: end });
  return (json.Data ?? []) as FbAdjustment[];
}

/** Quick connectivity check — returns error message if fails */
export async function pingFullbay(): Promise<{ ok: boolean; error?: string }> {
  try {
    await fb("getAdjustments.php", { startDate: "2024-01-01", endDate: "2024-01-02" });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function getDetectedIp(): Promise<string> {
  return getServerIp();
}
