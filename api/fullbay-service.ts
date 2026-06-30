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

/** Margen de ganancia sobre costo. Ej: 1.3 = 30% ganancia, 1.5 = 50%. Default 1.0 (sin margen) */
const MARGIN = () => {
  const m = parseFloat(process.env.FULLBAY_MARGIN || "1.0");
  return isNaN(m) || m <= 0 ? 1.0 : m;
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

export interface FbAdjustment {
  PartNumber: string;
  PartName: string;
  QtyChanged: number;
  NewOnHand: number;
  Reason: string;
  Date: string;
  Location: string;
  Cost: string;
  SellingPrice: string;
}

/**
 * Fetch adjustments in 7-day chunks (Fullbay API limit).
 * Combines results from multiple requests.
 */
export async function fb(endpoint: string, params: Record<string, string> = {}): Promise<any> {
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

/**
 * Acumula ajustes de inventario por partNumber.
 * Fullbay devuelve quantityChange como delta (cambio), no stock actual.
 * Sumamos todo el historial para obtener el stock real de cada parte.
 * Para precio: sellingPrice siempre es 0 en Fullbay, usamos cost.
 */
export async function getInventoryAdjustments(daysBack = 365): Promise<FbAdjustment[]> {
  // Mapa para acumular por partNumber: { qtyTotal, cost, name }
  const partMap = new Map<string, { name: string; qty: number; cost: string; date: string }>();
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

    const resultSet = json.resultSet || json.Data || [];
    for (const adjustment of resultSet) {
      const lines = adjustment.Lines || [];
      for (const line of lines) {
        if (!line.partNumber) continue;

        const pn = line.partNumber;
        const change = Number(line.quantityChange || 0);
        const existing = partMap.get(pn);

        if (existing) {
          existing.qty += change;
          // Solo actualizamos cost si el nuevo es mayor que 0 y mejor
          const newCost = Number(line.cost || 0);
          if (newCost > 0) {
            existing.cost = String(newCost);
          }
        } else {
          const costVal = Number(line.cost || 0);
          partMap.set(pn, {
            name: line.description || pn,
            qty: change,
            cost: costVal > 0 ? String(costVal) : "0",
            date: line.created || adjustment.created || "",
          });
        }
      }
    }

    chunkEnd = new Date(chunkStart.getTime() - msPerDay);
    daysRemaining -= chunkSize;
  }

  // Convertir el mapa a array de FbAdjustment con stock real acumulado
  const result: FbAdjustment[] = [];
  for (const [pn, data] of partMap) {
    // Ignorar partes con stock negativo o cero (no las vendemos)
    if (data.qty <= 0) continue;

    result.push({
      PartNumber: pn,
      PartName: data.name,
      QtyChanged: data.qty, // Stock total acumulado
      NewOnHand: data.qty,
      Reason: "Accumulated",
      Date: data.date,
      Location: "",
      Cost: data.cost,
      SellingPrice: "0", // Fullbay no tiene precio de venta
    });
  }

  return result;
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

/**
 * Calcula precio de venta con margen inteligente segun el costo:
 * - Costo < $10  → margen 1.5 (50% ganancia)
 * - Costo >= $10 → margen 1.3 (30% ganancia)
 * - Costo <= 0   → precio $0
 * 
 * Todo es editable despues desde el panel de admin.
 */
export function getSellingPrice(cost: string): string {
  const c = parseFloat(cost || "0");
  if (c <= 0) return "0";
  const margin = c < 10 ? 1.5 : 1.3;
  return (c * margin).toFixed(2);
}

/** Devuelve el margen que se aplicaria para un costo dado */
export function getMarginForCost(cost: string): number {
  const c = parseFloat(cost || "0");
  if (c <= 0) return 0;
  return c < 10 ? 1.5 : 1.3;
}
