import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

const staticFiles: Record<string, { content: Buffer; type: string }> = {};

function loadFile(p: string): Buffer | null {
  try {
    if (fs.existsSync(p)) return fs.readFileSync(p);
  } catch { /* ignore */ }
  return null;
}

function mimeType(ext: string): string {
  const map: Record<string, string> = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

export function getIndexHtml(): string | null {
  const entry = staticFiles["/"];
  return entry ? entry.content.toString("utf-8") : null;
}

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Pre-load all known static files at startup
  const filesToLoad = [
    ["/", "index.html"],
    ["/assets/index-DrELWHEp.js", "assets/index-DrELWHEp.js"],
    ["/assets/index-DxcCtCaC.css", "assets/index-DxcCtCaC.css"],
    ["/hero-bg.jpg", "hero-bg.jpg"],
    ["/product-brake.jpg", "product-brake.jpg"],
    ["/product-turbo.jpg", "product-turbo.jpg"],
    ["/warehouse-interior.jpg", "warehouse-interior.jpg"],
  ];

  for (const [urlPath, fileName] of filesToLoad) {
    const content = loadFile(path.join(distPath, fileName));
    if (content) {
      staticFiles[urlPath] = {
        content,
        type: mimeType(path.extname(fileName)),
      };
    }
  }

  const html = getIndexHtml();

  // Root route
  app.get("/", (c) => {
    if (html) return c.html(html);
    return c.text("Loading...", 503);
  });

  // Static file routes
  for (const [urlPath, file] of Object.entries(staticFiles)) {
    if (urlPath === "/") continue;
    app.get(urlPath, (c) => {
      return c.body(new Uint8Array(file.content), 200, { "Content-Type": file.type });
    });
  }

  // SPA fallback for client-side routes
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html") && html) {
      return c.html(html);
    }
    return c.json({ error: "Not Found" }, 404);
  });
}
