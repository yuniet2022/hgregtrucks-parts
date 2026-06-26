/**
 * Fullbay Inventory Sync Service
 * Docs: https://gist.github.com/EpikaNick/38f2ac3ee83bd7f84f5f991ffb43e5a1
 *
 * Fullbay API uses SHA1 token authentication:
 *   token = sha1(key + todaysDate + ipAddress)
 *
 * Env vars:
 *   FULLBAY_API_KEY  - Your Fullbay API key (e.g. 88816fee-5d15-e4ee-ab41-a3020a6c742c)
 *   FULLBAY_IP       - Public IP of your Railway server (get from Railway dashboard)
 */

import { createHash } from "crypto";

const API_KEY = () => {
  const key = process.env.FULLBAY_API_KEY;
  if (!key) throw new Error("FULLBAY_API_KEY not set");
  return key;
};

const SERVER_IP = () => {
  const ip = process.env.FULLBAY_IP;
  if (!ip) throw new Error("FULLBAY_IP not set. Get your Railway server public IP from the Railway dashboard.");
  return ip;
};

function generateToken(): string {
  const key = API_KEY();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const ip = SERVER_IP();
  const hashInput = `${key}${today}${ip}`;
  return createHash("sha1").update(hashInput).digest("hex");
}

async function fb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`https://app.fullbay.com/services/${endpoint}`);

  // Add auth params
  url.searchParams.set("key", API_KEY());
  url.searchParams.set("token", generateToken());

  // Add all other params
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

/** Read inventory adjustments from Fullbay (last 7 days max per API limit) */
export async function getInventoryAdjustments(daysBack = 7): Promise<FbAdjustment[]> {
  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];
  const json = await fb("getAdjustments.php", { startDate: start, endDate: end });
  return (json.Data ?? []) as FbAdjustment[];
}

/** Quick connectivity check */
export async function pingFullbay(): Promise<boolean> {
  try {
    await fb("getAdjustments.php", { startDate: "2024-01-01", endDate: "2024-01-02" });
    return true;
  } catch { return false; }
}
