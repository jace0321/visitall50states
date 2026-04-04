"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { compressImageForUpload, extensionForMime } from "@/lib/image-compress";
import { shouldConvertHeic } from "@/lib/heic-convert";
import {
  MAX_PHOTOS_PER_STATE_ENTRY,
  MAX_VIDEO_UPLOAD_BYTES,
  MAX_VIDEOS_PER_STATE_ENTRY,
  TRAVELER_STATE_MEDIA_BUCKET,
  type TravelerStateMediaTableRow,
} from "@/lib/traveler-state-media";
import { captureVideoPosterAndMetadata } from "@/lib/video-poster";

function storagePathFromPublicUrl(fullUrl: string, bucket: string): string | null {
  const needle = `/object/public/${bucket}/`;
  const i = fullUrl.indexOf(needle);
  if (i === -1) return null;
  return decodeURIComponent(fullUrl.slice(i + needle.length));
}

function videoExt(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".webm")) return "webm";
  if (n.endsWith(".mov")) return "mov";
  return "mp4";
}

type Props = {
  supabase: SupabaseClient;
  travelerProfileId: string;
  userId: string;
  stateEntryId: string | null;
  mediaItems: TravelerStateMediaTableRow[];
  legacyPhotoCount: number;
  onMediaChange: () => Promise<void>;
  stateLabel: string;
};

export default function StateEntryMediaManager({
  supabase,
  travelerProfileId,
  userId,
  stateEntryId,
  mediaItems,
  legacyPhotoCount,
  onMediaChange,
  stateLabel,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setCaptionDrafts((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const m of mediaItems) {
        if (next[m.id] === undefined) next[m.id] = m.caption ?? "";
      }
      for (const id of Object.keys(next)) {
        if (!mediaItems.some((m) => m.id === id)) delete next[id];
      }
      return next;
    });
  }, [mediaItems]);

  const photoCount =
    mediaItems.filter((m) => m.media_kind === "photo").length + legacyPhotoCount;
  const videoCount = mediaItems.filter((m) => m.media_kind === "video").length;
  const canAddMorePhotos = photoCount < MAX_PHOTOS_PER_STATE_ENTRY;
  const canAddMoreVideos = videoCount < MAX_VIDEOS_PER_STATE_ENTRY;

  function displayUrl(row: TravelerStateMediaTableRow): string | null {
    if (row.public_url) return row.public_url;
    if (!row.storage_path || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
    return `${base}/storage/v1/object/public/${TRAVELER_STATE_MEDIA_BUCKET}/${row.storage_path}`;
  }

  function thumbUrl(row: TravelerStateMediaTableRow): string | null {
    if (row.media_kind === "video" && row.poster_url) return row.poster_url;
    return displayUrl(row);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !stateEntryId) return;
    setError(null);
    setBusy(true);
    try {
      const list: File[] = [];
      for (const f of Array.from(files)) {
        if (f.type.startsWith("image/")) {
          list.push(f);
          continue;
        }
        if (await shouldConvertHeic(f)) {
          list.push(f);
        }
      }
      if (list.length === 0) {
        setError("Choose image files (JPEG, PNG, WebP, GIF, or iPhone HEIC/HEIF).");
        return;
      }

      const remainingSlots = MAX_PHOTOS_PER_STATE_ENTRY - photoCount;
      const toUpload = list.slice(0, Math.max(0, remainingSlots));
      if (toUpload.length < list.length) {
        setError(`Only ${remainingSlots} photo slot(s) left (${MAX_PHOTOS_PER_STATE_ENTRY} max per state).`);
      }

      const maxOrder = mediaItems.reduce((acc, m) => Math.max(acc, m.sort_order ?? 0), -1);
      const hasFeatured = mediaItems.some((m) => m.is_featured);

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const compressed = await compressImageForUpload(file);
        const ext = extensionForMime(compressed.mimeType);
        const objectPath = `${userId}/${stateEntryId}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(TRAVELER_STATE_MEDIA_BUCKET)
          .upload(objectPath, compressed.blob, {
            cacheControl: "3600",
            upsert: false,
            contentType: compressed.mimeType,
          });

        if (upErr) {
          throw new Error(upErr.message);
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).getPublicUrl(objectPath);

        const sortOrder = maxOrder + 1 + i;
        const isFeatured = !hasFeatured && mediaItems.length === 0 && i === 0;

        const { error: insErr } = await supabase.from("traveler_state_media").insert({
          traveler_state_entry_id: stateEntryId,
          traveler_profile_id: travelerProfileId,
          media_kind: "photo",
          storage_provider: "supabase",
          storage_bucket: TRAVELER_STATE_MEDIA_BUCKET,
          storage_path: objectPath,
          public_url: publicUrl,
          caption: "",
          alt_text: `${stateLabel} travel photo`,
          mime_type: compressed.mimeType,
          width: compressed.width,
          height: compressed.height,
          file_bytes: compressed.blob.size,
          sort_order: sortOrder,
          is_featured: isFeatured,
        });

        if (insErr) {
          await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).remove([objectPath]);
          throw new Error(insErr.message);
        }
      }

      await onMediaChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleVideoFiles(files: FileList | null) {
    if (!files?.length || !stateEntryId) return;
    setError(null);
    setBusy(true);
    try {
      const list = Array.from(files).filter((f) => f.type.startsWith("video/"));
      if (list.length === 0) {
        setError("Choose video files (MP4, WebM, or QuickTime). Export or compress large clips before uploading.");
        return;
      }

      const remainingVideoSlots = MAX_VIDEOS_PER_STATE_ENTRY - videoCount;
      const toUpload = list.slice(0, Math.max(0, remainingVideoSlots));
      if (toUpload.length < list.length) {
        setError(`Only ${remainingVideoSlots} video slot(s) left (${MAX_VIDEOS_PER_STATE_ENTRY} max per state).`);
      }

      const maxOrder = mediaItems.reduce((acc, m) => Math.max(acc, m.sort_order ?? 0), -1);
      const hasFeatured = mediaItems.some((m) => m.is_featured);

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
          throw new Error(`“${file.name}” is over 50 MB. Compress the clip and try again.`);
        }

        const { durationSeconds, width, height, posterBlob } = await captureVideoPosterAndMetadata(file);
        const vid = crypto.randomUUID();
        const ext = videoExt(file);
        const videoPath = `${userId}/${stateEntryId}/${vid}.${ext}`;
        const posterPath = `${userId}/${stateEntryId}/poster-${vid}.jpg`;

        const { error: vErr } = await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).upload(videoPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || `video/${ext === "mov" ? "quicktime" : ext}`,
        });
        if (vErr) throw new Error(vErr.message);

        const { error: pErr } = await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).upload(posterPath, posterBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });
        if (pErr) {
          await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).remove([videoPath]);
          throw new Error(pErr.message);
        }

        const {
          data: { publicUrl: videoPublicUrl },
        } = supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).getPublicUrl(videoPath);
        const {
          data: { publicUrl: posterPublicUrl },
        } = supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).getPublicUrl(posterPath);

        const sortOrder = maxOrder + 1 + i;
        const isFeatured = !hasFeatured && mediaItems.length === 0 && i === 0;

        const { error: insErr } = await supabase.from("traveler_state_media").insert({
          traveler_state_entry_id: stateEntryId,
          traveler_profile_id: travelerProfileId,
          media_kind: "video",
          storage_provider: "supabase",
          storage_bucket: TRAVELER_STATE_MEDIA_BUCKET,
          storage_path: videoPath,
          public_url: videoPublicUrl,
          poster_url: posterPublicUrl,
          caption: "",
          alt_text: `${stateLabel} travel video`,
          mime_type: file.type || "video/mp4",
          width,
          height,
          duration_seconds: Math.round(durationSeconds * 100) / 100,
          file_bytes: file.size,
          sort_order: sortOrder,
          is_featured: isFeatured,
        });

        if (insErr) {
          await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).remove([videoPath, posterPath]);
          throw new Error(insErr.message);
        }
      }

      await onMediaChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video upload failed.");
    } finally {
      setBusy(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function setFeatured(mediaId: string) {
    if (!stateEntryId) return;
    setBusy(true);
    setError(null);
    try {
      await supabase.from("traveler_state_media").update({ is_featured: false }).eq("traveler_state_entry_id", stateEntryId);
      const { error: u } = await supabase.from("traveler_state_media").update({ is_featured: true }).eq("id", mediaId);
      if (u) throw new Error(u.message);
      await onMediaChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update cover photo.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMedia(row: TravelerStateMediaTableRow) {
    setBusy(true);
    setError(null);
    try {
      const paths: string[] = [];
      if (row.storage_path) paths.push(row.storage_path);
      if (row.media_kind === "video" && row.poster_url) {
        const p = storagePathFromPublicUrl(row.poster_url, TRAVELER_STATE_MEDIA_BUCKET);
        if (p) paths.push(p);
      }
      if (paths.length > 0) {
        await supabase.storage.from(TRAVELER_STATE_MEDIA_BUCKET).remove(paths);
      }
      const { error: d } = await supabase.from("traveler_state_media").delete().eq("id", row.id);
      if (d) throw new Error(d.message);
      await onMediaChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete media.");
    } finally {
      setBusy(false);
    }
  }

  async function saveCaption(id: string) {
    const caption = (captionDrafts[id] ?? "").trim();
    setBusy(true);
    setError(null);
    try {
      const { error: u } = await supabase
        .from("traveler_state_media")
        .update({ caption, alt_text: caption || `${stateLabel} travel photo` })
        .eq("id", id);
      if (u) throw new Error(u.message);
      await onMediaChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save caption.");
    } finally {
      setBusy(false);
    }
  }

  if (!stateEntryId) {
    return (
      <p className="mt-4 text-sm leading-7 text-asphalt/62">
        Save this state entry once so it has a stable ID. Then you can add photos here — they will appear on your public journal page.
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        multiple
        className="hidden"
        onChange={(e) => void handleVideoFiles(e.target.files)}
      />

      <p className="text-sm leading-relaxed text-asphalt/62">
        <span className="font-semibold text-asphalt/85">Accepted — </span>
        Photos: JPEG, PNG, WebP, GIF, or iPhone HEIC/HEIF (HEIC is converted on our server before saving). Videos: MP4, WebM, or
        MOV. See limits below.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          disabled={busy || !canAddMorePhotos}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-night px-5 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-night/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : "Add photos"}
        </button>
        <button
          type="button"
          disabled={busy || !canAddMoreVideos}
          onClick={() => videoInputRef.current?.click()}
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-asphalt transition hover:border-asphalt/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Working…" : "Add video"}
        </button>
        <span className="text-sm text-asphalt/55">
          {photoCount}/{MAX_PHOTOS_PER_STATE_ENTRY} photos · {videoCount}/{MAX_VIDEOS_PER_STATE_ENTRY} videos · photos resized to {1920}px; videos max{" "}
          {Math.round(MAX_VIDEO_UPLOAD_BYTES / (1024 * 1024))} MB each (compress before upload)
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      {mediaItems.length > 0 ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {mediaItems.map((row, index) => {
            const src = thumbUrl(row);
            const draft = captionDrafts[row.id] ?? row.caption ?? "";
            const isVideo = row.media_kind === "video";
            return (
              <li
                key={row.id}
                className="flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={row.alt_text || row.caption || `${stateLabel} ${isVideo ? "video" : "photo"} ${index + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-asphalt/45">Preview unavailable</div>
                  )}
                  {isVideo ? (
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      Video
                    </span>
                  ) : null}
                  {row.is_featured ? (
                    <span className="absolute left-3 top-3 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                      Cover
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-4">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-asphalt/42">Caption</label>
                  <textarea
                    value={draft}
                    disabled={busy}
                    onChange={(e) => setCaptionDrafts((d) => ({ ...d, [row.id]: e.target.value }))}
                    rows={2}
                    placeholder="What was happening in this frame?"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveCaption(row.id)}
                      className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-asphalt/80 hover:border-asphalt/25"
                    >
                      Save caption
                    </button>
                    {!row.is_featured ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void setFeatured(row.id)}
                        className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900 hover:bg-amber-100"
                      >
                        Set as cover
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeMedia(row)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-asphalt/55">No uploaded photos yet for this state.</p>
      )}
    </div>
  );
}
