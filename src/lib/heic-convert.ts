/**
 * HEIC/HEIF must be converted before createImageBitmap / canvas (unreliable in browsers).
 * All conversion goes through POST /api/heic-convert (Sharp on the server).
 * ftyp sniff handles extensionless Windows/iCloud picks.
 */

import { HEIC_CONVERT_FAILURE_MESSAGE } from "@/lib/heic-user-message";

const HEIC_FTYP_BRANDS = /^(heic|heix|hevc|hevx|mif1|msf1|heim|heis|heif)$/i;

function detectHeicFromFtypBuffer(buf: Uint8Array): boolean {
  if (!buf || buf.length < 12) return false;
  const len = buf.length;
  for (let i = 0; i <= len - 8; i++) {
    if (buf[i] !== 102 || buf[i + 1] !== 116 || buf[i + 2] !== 121 || buf[i + 3] !== 112) continue;
    const brand = String.fromCharCode(buf[i + 4], buf[i + 5], buf[i + 6], buf[i + 7]);
    if (HEIC_FTYP_BRANDS.test(brand)) return true;
  }
  return false;
}

export function isHeicLike(file: File): boolean {
  const n = (file.name || "").toLowerCase();
  if (n.endsWith(".heic") || n.endsWith(".heif")) return true;
  const t = (file.type || "").toLowerCase();
  return t === "image/heic" || t === "image/heif";
}

export function sniffHeicFromFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file || file.size < 12) {
      resolve(false);
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      try {
        resolve(detectHeicFromFtypBuffer(new Uint8Array(r.result as ArrayBuffer)));
      } catch {
        resolve(false);
      }
    };
    r.onerror = () => resolve(false);
    r.readAsArrayBuffer(file.slice(0, Math.min(16384, file.size)));
  });
}

export async function shouldConvertHeic(file: File): Promise<boolean> {
  if (isHeicLike(file)) return true;
  return sniffHeicFromFile(file);
}

export async function convertHeicToJpegViaServer(file: File): Promise<File> {
  const form = new FormData();
  form.append("file", file, file.name || "photo.heic");

  let res: Response;
  try {
    res = await fetch("/api/heic-convert", {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error(
      "Couldn't reach the server to convert this photo. Check your connection, or export as JPEG from Photos and try again."
    );
  }

  if (!res.ok) {
    let message = HEIC_CONVERT_FAILURE_MESSAGE;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      /* use default */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  let baseName = (file.name || "photo").replace(/\.(heic|heif)$/i, ".jpg");
  if (!/\.(jpe?g|png|webp)$/i.test(baseName)) baseName = `${baseName}.jpg`;
  return new File([blob], baseName, { type: "image/jpeg" });
}

/** JPEG/PNG/WebP/GIF pass through; HEIC/HEIF (incl. extensionless) → JPEG via server. */
export async function rasterizeImageFileIfNeeded(file: File): Promise<File> {
  if (await shouldConvertHeic(file)) {
    return convertHeicToJpegViaServer(file);
  }
  return file;
}
