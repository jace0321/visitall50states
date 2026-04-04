import { NextResponse } from "next/server";
import sharp from "sharp";

import { HEIC_CONVERT_FAILURE_MESSAGE } from "@/lib/heic-user-message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_EDGE = 2800;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const input = formData.get("file");

    if (!(input instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (input.size <= 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    if (input.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const arrayBuffer = await input.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const transformed = await sharp(inputBuffer, { failOn: "none", pages: 1 })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(transformed), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
        "Content-Disposition": `inline; filename="${(input.name || "photo").replace(/\.[^.]+$/, "")}.jpg"`
      }
    });
  } catch (error) {
    // Full detail for operators only — never expose raw libheif/sharp messages to clients.
    console.error("HEIC convert route failed", error);
    return NextResponse.json({ error: HEIC_CONVERT_FAILURE_MESSAGE }, { status: 500 });
  }
}
