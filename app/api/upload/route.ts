import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

    // Cloudinary if configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudApiKey = process.env.CLOUDINARY_API_KEY;
    const cloudApiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && cloudApiKey && cloudApiSecret) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: cloudName,
        api_key: cloudApiKey,
        api_secret: cloudApiSecret,
      });

      const uploadFromBuffer = (buffer: Buffer) =>
        new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "uploads", public_id: filename },
            (error: any, result: any) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(buffer);
        });

      const result = await uploadFromBuffer(buffer);
      const url = (result && (result.secure_url || result.url)) || null;
      if (!url) throw new Error("Cloudinary upload failed");
      return NextResponse.json({ url }, { status: 200, headers: corsHeaders });
    }

    // Local fallback only for devenv
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
