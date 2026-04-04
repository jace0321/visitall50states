import { rasterizeImageFileIfNeeded } from "@/lib/heic-convert";

export type CompressedImage = {
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
};

const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;
const WEBP_QUALITY = 0.85;

/**
 * Downscales large photos in-browser and re-encodes as WebP when supported, else JPEG.
 * HEIC/HEIF is converted to JPEG via POST /api/heic-convert before encoding.
 */
export async function compressImageForUpload(file: File): Promise<CompressedImage> {
  const raster = await rasterizeImageFileIfNeeded(file);
  const bitmap = await createImageBitmap(raster);
  const iw = bitmap.width;
  const ih = bitmap.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(iw, ih));
  const w = Math.round(iw * scale);
  const h = Math.round(ih * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not prepare canvas for this image.");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let mimeType = "image/jpeg";
  try {
    const probe = canvas.toDataURL("image/webp", WEBP_QUALITY);
    if (probe.startsWith("data:image/webp")) mimeType = "image/webp";
  } catch {
    mimeType = "image/jpeg";
  }

  const quality = mimeType === "image/jpeg" ? JPEG_QUALITY : WEBP_QUALITY;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image."))),
      mimeType,
      quality
    );
  });

  return { blob, mimeType, width: w, height: h };
}

export function extensionForMime(mimeType: string): string {
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}
