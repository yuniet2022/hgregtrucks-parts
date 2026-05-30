import { Hono } from "hono";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = "/app/uploads";

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

export const uploadApp = new Hono();

uploadApp.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || !(file instanceof File)) {
      return c.json({ ok: false, error: "No file provided" }, 400);
    }

    await ensureDir(UPLOAD_DIR);

    const ext = path.extname(file.name) || ".jpg";
    const name = crypto.randomBytes(8).toString("hex") + ext;
    const filepath = path.join(UPLOAD_DIR, name);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Return URL that Nginx will serve
    const url = `/uploads/${name}`;
    return c.json({ ok: true, url });
  } catch (e: any) {
    console.error("[upload] Error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});
