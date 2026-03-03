import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers: corsHeaders });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = file.name ?? "file";
    const name = originalName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}_${name}`;

    // Cloudinary via direct API if configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && cloudApiKey && cloudApiSecret) {
      const timestamp = Math.round(Date.now() / 1000);
      const stringToSign = `timestamp=${timestamp}${cloudApiSecret}`;
      const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

      const form = new FormData();
      // Node's undici FormData supports Buffer; cast to any to satisfy TS.
      form.append("file", buffer as any, filename);
      form.append("api_key", cloudApiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form as any,
      });

      if (!cloudRes.ok) {
        const text = await cloudRes.text().catch(() => "");
        console.error("Cloudinary upload failed:", cloudRes.status, text.slice(0, 200));
        return NextResponse.json(
          { error: "Cloudinary upload failed" },
          { status: 500, headers: corsHeaders }
        );
      }

      const data = (await cloudRes.json().catch(() => null)) as any;
      const url = data && (data.secure_url || data.url);
      if (!url) {
        console.error("Cloudinary upload missing URL field:", data);
        return NextResponse.json(
          { error: "Cloudinary upload failed" },
          { status: 500, headers: corsHeaders }
        );
      }

      return NextResponse.json({ url }, { status: 200, headers: corsHeaders });
    }

    // Local fallback only for dev env
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Must configure a provider in production." },
        { status: 500, headers: corsHeaders }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("POST /api/upload:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500, headers: corsHeaders });
  }
}
