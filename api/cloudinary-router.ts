import { Hono } from "hono";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dkb1uqbni",
  api_key: "584528719753179",
  api_secret: "jshxScb-Z0Zx0XLYVkB5R3xS0sc",
  secure: true,
});

const app = new Hono();

// Get upload signature for secure direct upload from browser
app.get("/api/cloudinary-signature", (c) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder: "hgreg_parts",
    overwrite: true,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    "jshxScb-Z0Zx0XLYVkB5R3xS0sc"
  );
  return c.json({
    signature,
    timestamp,
    apiKey: "584528719753179",
    cloudName: "dkb1uqbni",
    folder: "hgreg_parts",
  });
});

// Upload via server (multipart)
app.post("/api/cloudinary-upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (!file || !(file instanceof File)) {
      return c.json({ ok: false, error: "No file" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "hgreg_parts",
            overwrite: true,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return c.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (e: any) {
    console.error("[cloudinary] Upload error:", e.message);
    return c.json({ ok: false, error: e.message }, 500);
  }
});

export default app;
