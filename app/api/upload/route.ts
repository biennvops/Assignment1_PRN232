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
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const name = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `${Date.now()}_${name}`;
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("POST /api/upload:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500, headers: corsHeaders });
  }
}
