"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { HEIC_CONVERT_FAILURE_MESSAGE } from "@/lib/heic-user-message";

const MAX_BYTES = 25 * 1024 * 1024;

function clearlyNotHeic(file: File): boolean {
  const n = file.name.toLowerCase();
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("image/jpeg") || t === "image/jpg" || t === "image/png" || t === "image/webp" || t === "image/gif") {
    return true;
  }
  return /\.(jpe?g|png|gif|webp)$/i.test(n);
}

/** Second chance when Sharp fails: same approach we removed from map-maker, isolated to this page. */
async function convertWithHeic2any(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  try {
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    return Array.isArray(result) ? result[0] : result;
  } catch {
    const result = await heic2any({ blob: file, toType: "image/png" });
    return Array.isArray(result) ? result[0] : result;
  }
}

function triggerDownload(blob: Blob, originalFile: File, ext: string) {
  const base = (originalFile.name || "photo").replace(/\.[^.]+$/, "") || "photo";
  const outName = `${base}.${ext}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = outName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return outName;
}

export default function HeicToJpegConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"server" | "browser" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastOkName, setLastOkName] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<"server" | "browser" | null>(null);

  const pickFile = useCallback((f: File | null) => {
    setError(null);
    setLastOkName(null);
    setSuccessNote(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setError("That file is too large (max 25 MB). Try a smaller export or compress in Photos first.");
      return;
    }
    if (f.size <= 0) {
      setFile(null);
      setError("That file looks empty.");
      return;
    }
    setFile(f);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setLastOkName(null);
    setSuccessNote(null);
    setPhase("server");

    const runBrowserFallback = async (afterServerMessage: string) => {
      setPhase("browser");
      try {
        const blob = await convertWithHeic2any(file);
        const ext = blob.type === "image/png" ? "png" : "jpg";
        const outName = triggerDownload(blob, file, ext);
        setLastOkName(outName);
        setSuccessNote("browser");
      } catch {
        setError(afterServerMessage);
      }
    };

    try {
      const form = new FormData();
      form.append("file", file, file.name || "photo.heic");
      let res: Response;
      try {
        res = await fetch("/api/heic-convert", {
          method: "POST",
          body: form,
        });
      } catch (netErr) {
        // Offline or server unreachable — still try in-browser conversion
        if (netErr instanceof TypeError) {
          await runBrowserFallback(
            "Couldn't reach our server and in-browser conversion didn't work. Check your connection, or export as JPEG from Photos."
          );
          return;
        }
        throw netErr;
      }

      if (res.ok) {
        const blob = await res.blob();
        const outName = triggerDownload(blob, file, "jpg");
        setLastOkName(outName);
        setSuccessNote("server");
        return;
      }

      let serverMsg = HEIC_CONVERT_FAILURE_MESSAGE;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error && typeof body.error === "string") serverMsg = body.error;
      } catch {
        /* use default */
      }

      if (res.status === 413) {
        setError("File too large (max 25 MB). Try a smaller photo or export as JPEG from Photos.");
        return;
      }

      await runBrowserFallback(serverMsg);
    } catch (e) {
      if (e instanceof TypeError && /fetch|network/i.test(String(e.message))) {
        await runBrowserFallback(
          "Couldn't reach our server and in-browser conversion didn't work. Check your connection, or export as JPEG from Photos."
        );
        return;
      }
      setError(e instanceof Error ? e.message : HEIC_CONVERT_FAILURE_MESSAGE);
    } finally {
      setBusy(false);
      setPhase(null);
    }
  };

  const busyLabel =
    phase === "browser" ? "Trying in your browser…" : phase === "server" ? "Converting on our server…" : "Converting…";

  return (
    <div className="space-y-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/heic,image/heif,.heic,.heif"
        className="sr-only"
        aria-label="Choose HEIC or HEIF file"
        onChange={onInputChange}
      />

      <p className="text-center text-xs text-white/50">
        Input types: <span className="text-white/70">.heic</span>, <span className="text-white/70">.heif</span> · max 25 MB
      </p>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={onDrop}
        className="rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.04] px-6 py-10 text-center transition hover:border-amber-brand/50 hover:bg-white/[0.06]"
      >
        <p className="text-sm font-medium text-white/90">
          Drop a <span className="text-amber-brand">.heic</span> / <span className="text-amber-brand">.heif</span> here
        </p>
        <p className="mt-2 text-sm text-white/55">or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-amber-brand/40 hover:bg-amber-brand/15"
        >
          Choose file
        </button>
        {file && (
          <p className="mt-4 truncate text-xs text-white/60" title={file.name}>
            Selected: <span className="text-white/85">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      {file && clearlyNotHeic(file) && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95">
          This tool is for iPhone <strong>HEIC/HEIF</strong> files. Your file doesn&apos;t look like HEIC — you can open JPEG/PNG/WebP
          directly in the{" "}
          <Link href="/map-maker" className="font-semibold text-amber-200 underline-offset-2 hover:underline">
            map maker
          </Link>
          .
        </p>
      )}

      <button
        type="button"
        disabled={!file || busy}
        onClick={() => void convert()}
        className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-night shadow-lg shadow-amber-900/30 transition hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? busyLabel : "Convert to JPEG & download"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-400/35 bg-red-950/40 px-4 py-3 text-sm leading-relaxed text-red-100/95">
          {error}
        </div>
      )}

      {lastOkName && !error && (
        <div className="space-y-1 text-center text-sm text-emerald-200/95">
          <p>
            Download started — look for <span className="font-semibold">{lastOkName}</span> in your Downloads folder.
          </p>
          {successNote === "browser" && (
            <p className="text-xs text-emerald-200/75">
              Converted in your browser (our server couldn&apos;t read this HEIC — your file stayed on your device for this step).
            </p>
          )}
        </div>
      )}

      <p className="text-center text-xs leading-relaxed text-white/45">
        We try <strong className="text-white/60">our server first</strong>, then <strong className="text-white/60">your browser</strong>{" "}
        if needed. Nothing is stored. If both fail, export as JPEG from the Photos app or use{" "}
        <strong className="text-white/60">Camera → Formats → Most Compatible</strong> for new photos.
      </p>
    </div>
  );
}
