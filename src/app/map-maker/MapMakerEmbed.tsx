"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { syncMapMakerPhotosToTraveler } from "@/lib/sync-map-maker-photos";
import { saveUsersMapStates } from "@/lib/users-maps-save";
import US_STATE_PATHS from "@/lib/us-map-paths";

const CODE_TO_NAME = new Map(US_STATE_PATHS.map((s) => [s.code, s.name]));
const VALID_STATE_NAMES = new Set(US_STATE_PATHS.map((s) => s.name));

/** Map-maker may send 2-letter codes or (legacy) full state names — normalize to canonical full names. */
function resolveStateName(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  const t = String(raw).trim();
  if (!t) return undefined;
  const upper = t.toUpperCase();
  if (CODE_TO_NAME.has(upper)) return CODE_TO_NAME.get(upper);
  if (VALID_STATE_NAMES.has(t)) return t;
  return undefined;
}

function formatSyncFailure(reason: unknown): string {
  let base: string;
  if (reason instanceof Error) base = reason.message;
  else if (reason && typeof reason === "object") {
    const o = reason as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [o.message, o.details, o.hint].filter((p): p is string => Boolean(p));
    base = parts.length ? parts.join(" — ") : "Sync failed — check that you’re signed in and the database has the users_maps table with RLS policies.";
  } else if (typeof reason === "string" && reason.trim()) base = reason.trim();
  else base = "Sync failed — check that you’re signed in and the database has the users_maps table with RLS policies.";

  if (/updated_at/i.test(base)) {
    base +=
      " Run the SQL in supabase/users_maps_fix_updated_at.sql in the Supabase SQL editor (adds the missing updated_at column your trigger expects).";
  }
  return base;
}

/** Network blips (e.g. “TypeError: Load failed”) sometimes break iframe postMessage — retry a few times. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 450 * (i + 1)));
      }
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

type MapMakerSummary = {
  type: "VISITALL50_MAP_MAKER_SUMMARY";
  stateCodes: string[];
  photoStateCodes: string[];
  flagVisitedCodes: string[];
  flagLivedCodes: string[];
};

function requestSummaryFromIframe(iframe: HTMLIFrameElement): Promise<MapMakerSummary> {
  return new Promise((resolve, reject) => {
    const win = iframe.contentWindow;
    if (!win) {
      reject(new Error("Map embed is not ready."));
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "VISITALL50_MAP_MAKER_SUMMARY") {
        window.removeEventListener("message", onMessage);
        clearTimeout(timer);
        resolve(event.data as MapMakerSummary);
      }
      if (event.data?.type === "VISITALL50_MAP_MAKER_SUMMARY_ERROR") {
        window.removeEventListener("message", onMessage);
        clearTimeout(timer);
        reject(new Error(event.data.message || "Map maker could not read progress."));
      }
    };

    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("No response from map maker (try again after the map loads)."));
    }, 10000);

    win.postMessage({ type: "VISITALL50_MAP_MAKER_REQUEST_SUMMARY" }, window.location.origin);
  });
}

function requestPhotoExportFromIframe(iframe: HTMLIFrameElement): Promise<{ stateCode: string; blob: Blob }[]> {
  return new Promise((resolve, reject) => {
    const win = iframe.contentWindow;
    if (!win) {
      reject(new Error("Map embed is not ready."));
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "VISITALL50_MAP_MAKER_PHOTO_EXPORT") {
        window.removeEventListener("message", onMessage);
        clearTimeout(timer);
        const raw = event.data.items;
        const items: { stateCode: string; blob: Blob }[] = [];
        if (Array.isArray(raw)) {
          for (const x of raw) {
            if (
              x &&
              typeof x === "object" &&
              "stateCode" in x &&
              "blob" in x &&
              (x as { blob: unknown }).blob instanceof Blob
            ) {
              items.push({ stateCode: String((x as { stateCode: unknown }).stateCode), blob: (x as { blob: Blob }).blob });
            }
          }
        }
        resolve(items);
      }
      if (event.data?.type === "VISITALL50_MAP_MAKER_PHOTO_EXPORT_ERROR") {
        window.removeEventListener("message", onMessage);
        clearTimeout(timer);
        reject(new Error(event.data.message || "Could not export photos from the map maker."));
      }
    };

    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("Timed out exporting map photos — try again after the map finishes loading."));
    }, 120000);

    win.postMessage({ type: "VISITALL50_MAP_MAKER_REQUEST_PHOTO_EXPORT" }, window.location.origin);
  });
}

export default function MapMakerEmbed() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [travelerUsername, setTravelerUsername] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncMessageOk, setSyncMessageOk] = useState(true);
  const [syncBusy, setSyncBusy] = useState(false);
  const [photoSyncBusy, setPhotoSyncBusy] = useState(false);
  const [fullSyncBusy, setFullSyncBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const sessionUserId = session?.user?.id;

  useEffect(() => {
    if (!sessionUserId) {
      setTravelerUsername(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("traveler_profiles")
      .select("username")
      .eq("user_id", sessionUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setTravelerUsername(typeof data?.username === "string" ? data.username : null);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionUserId, supabase]);

  const syncToTravelerMap = useCallback(async () => {
    setSyncMessage(null);
    setSyncMessageOk(true);
    const iframe = iframeRef.current;
    if (!iframe) {
      setSyncMessageOk(false);
      setSyncMessage("Map frame is not ready.");
      return;
    }
    if (!session?.user) {
      setSyncMessageOk(false);
      setSyncMessage("Sign in to sync.");
      return;
    }

    setSyncBusy(true);
    try {
      const summary = await withRetry(() => requestSummaryFromIframe(iframe));
      const rawCodes = Array.isArray(summary.stateCodes) ? summary.stateCodes : [];
      const names = Array.from(
        new Set(rawCodes.map((c) => resolveStateName(c)).filter((n): n is string => Boolean(n)))
      ).sort((a, b) => a.localeCompare(b));

      if (names.length === 0) {
        setSyncMessageOk(false);
        setSyncMessage(
          "No states found in this browser yet — mark states on the map (flag or color tab) or add photos, wait a second for them to save, then sync again."
        );
        return;
      }

      const { data: existing, error: fetchErr } = await supabase
        .from("users_maps")
        .select("states_visited")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const prev = Array.isArray((existing as { states_visited?: string[] } | null)?.states_visited)
        ? ((existing as { states_visited: string[] }).states_visited ?? [])
        : [];

      const merged = Array.from(new Set([...prev, ...names])).sort((a, b) => a.localeCompare(b));

      const { error: saveErr } = await saveUsersMapStates(supabase, session.user.id, merged);
      if (saveErr) throw saveErr;

      const added = names.filter((n) => !prev.includes(n)).length;
      setSyncMessageOk(true);
      setSyncMessage(
        `Saved ${merged.length} visited states (${added > 0 ? `${added} new this sync` : "no new states"}). This does not upload photos — states will stay solid green on the public map until you click “Upload map photos to journal” (or add photos in the dashboard).`
      );
    } catch (e) {
      console.error("Map maker sync error:", e);
      setSyncMessageOk(false);
      setSyncMessage(formatSyncFailure(e));
    } finally {
      setSyncBusy(false);
    }
  }, [session, supabase]);

  const syncPhotosToTravelerJournal = useCallback(async () => {
    setSyncMessage(null);
    setSyncMessageOk(true);
    const iframe = iframeRef.current;
    if (!iframe) {
      setSyncMessageOk(false);
      setSyncMessage("Map frame is not ready.");
      return;
    }
    if (!session?.user) {
      setSyncMessageOk(false);
      setSyncMessage("Sign in to upload photos.");
      return;
    }

    setPhotoSyncBusy(true);
    try {
      const items = await withRetry(() => requestPhotoExportFromIframe(iframe));
      if (items.length === 0) {
        setSyncMessageOk(false);
        setSyncMessage(
          "No placed photos found in this map yet — add photos to states in the tool above, wait for autosave, then try again."
        );
        return;
      }

      const result = await syncMapMakerPhotosToTraveler(supabase, session.user.id, items);
      const parts: string[] = [];
      if (result.uploaded.length) {
        parts.push(`Uploaded ${result.uploaded.length} photo(s): ${result.uploaded.join(", ")}.`);
      }
      if (result.skipped.length) {
        parts.push(`Skipped: ${result.skipped.join("; ")}.`);
      }
      if (result.errors.length) {
        parts.push(`Issues: ${result.errors.join(" ")}`);
      }

      if (result.uploaded.length === 0 && result.errors.length > 0) {
        setSyncMessageOk(false);
        setSyncMessage(parts.join(" ") || "Photo upload failed.");
        return;
      }

      setSyncMessageOk(true);
      setSyncMessage(
        parts.join(" ") +
          " Refresh your public traveler map — each upload from here becomes the featured cover for that state so the inset photo updates."
      );
    } catch (e) {
      console.error("Map maker photo sync error:", e);
      setSyncMessageOk(false);
      setSyncMessage(formatSyncFailure(e));
    } finally {
      setPhotoSyncBusy(false);
    }
  }, [session, supabase]);

  /** Saves visited list to Supabase, then uploads placed photos to journal (so they appear on the public map). */
  const syncFullMapToTravelerPage = useCallback(async () => {
    setSyncMessage(null);
    setSyncMessageOk(true);
    const iframe = iframeRef.current;
    if (!iframe) {
      setSyncMessageOk(false);
      setSyncMessage("Map frame is not ready.");
      return;
    }
    if (!session?.user) {
      setSyncMessageOk(false);
      setSyncMessage("Sign in to sync.");
      return;
    }

    setFullSyncBusy(true);
    try {
      const summary = await withRetry(() => requestSummaryFromIframe(iframe));
      const rawCodes = Array.isArray(summary.stateCodes) ? summary.stateCodes : [];
      const names = Array.from(
        new Set(rawCodes.map((c) => resolveStateName(c)).filter((n): n is string => Boolean(n)))
      ).sort((a, b) => a.localeCompare(b));

      if (names.length === 0) {
        setSyncMessageOk(false);
        setSyncMessage(
          "No states found in this browser yet — mark states or add photos, wait for autosave, then try again."
        );
        return;
      }

      const { data: existing, error: fetchErr } = await supabase
        .from("users_maps")
        .select("states_visited")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const prev = Array.isArray((existing as { states_visited?: string[] } | null)?.states_visited)
        ? ((existing as { states_visited: string[] }).states_visited ?? [])
        : [];

      const merged = Array.from(new Set([...prev, ...names])).sort((a, b) => a.localeCompare(b));

      const { error: saveErr } = await saveUsersMapStates(supabase, session.user.id, merged);
      if (saveErr) throw saveErr;

      const added = names.filter((n) => !prev.includes(n)).length;

      let photoMsg = "";
      try {
        const items = await withRetry(() => requestPhotoExportFromIframe(iframe));
        if (items.length === 0) {
          photoMsg =
            " Photos were not ready to export yet — wait a few seconds after placing images, then use “Save map to traveler page” again or “Upload map photos to journal.”";
        } else {
          const result = await syncMapMakerPhotosToTraveler(supabase, session.user.id, items);
          const bits: string[] = [];
          if (result.uploaded.length) bits.push(`uploaded: ${result.uploaded.join(", ")}`);
          if (result.skipped.length) bits.push(`skipped: ${result.skipped.join("; ")}`);
          if (result.errors.length) bits.push(`issues: ${result.errors.join(" ")}`);
          photoMsg = bits.length ? ` ${bits.join(" ")}` : " (no new photo uploads.)";
        }
      } catch (pe) {
        photoMsg = ` Photo upload step failed (${formatSyncFailure(pe)}). Visits are saved — try “Upload map photos to journal” next.`;
      }

      setSyncMessageOk(true);
      setSyncMessage(
        `Saved ${merged.length} visited states (${added > 0 ? `${added} new this run` : "visits unchanged"}).${photoMsg} Refresh your public traveler page to load the latest map.`
      );
    } catch (e) {
      console.error("Full map sync error:", e);
      setSyncMessageOk(false);
      setSyncMessage(formatSyncFailure(e));
    } finally {
      setFullSyncBusy(false);
    }
  }, [session, supabase]);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-asphalt">Traveler account sync</p>
          <p className="text-sm leading-relaxed text-asphalt/62">
            When your map looks right, use <strong className="text-asphalt/85">Save map to traveler page</strong> (below) to push both
            your visit list and your placed photos to the live map. The separate buttons are there if you only need one step.
          </p>
          <ul className="list-inside list-disc text-sm leading-relaxed text-asphalt/72">
            <li>
              <span className="font-medium text-asphalt">Save map to traveler page</span> — updates visited states{" "}
              <span className="font-medium">and</span> uploads placed photos so they appear inside each state on your public map.
            </li>
            <li>
              <span className="font-medium text-asphalt">Sync visited states only</span> — green fill on the live map, no photo upload.
            </li>
            <li>
              <span className="font-medium text-asphalt">Upload map photos to journal only</span> — photos without changing the visit list.
            </li>
          </ul>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {session ? (
            <>
              <button
                type="button"
                disabled={fullSyncBusy || syncBusy || photoSyncBusy}
                onClick={() => void syncFullMapToTravelerPage()}
                className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-night shadow-sm transition hover:bg-amber-400 disabled:opacity-50"
              >
                {fullSyncBusy ? "Saving map…" : "Save map to traveler page"}
              </button>
              <button
                type="button"
                disabled={syncBusy || photoSyncBusy || fullSyncBusy}
                onClick={() => void syncToTravelerMap()}
                className="rounded-full bg-night px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-night/90 disabled:opacity-50"
              >
                {syncBusy ? "Syncing…" : "Sync visited states only"}
              </button>
              <button
                type="button"
                disabled={photoSyncBusy || syncBusy || fullSyncBusy}
                onClick={() => void syncPhotosToTravelerJournal()}
                className="rounded-full border border-amber-400/90 bg-amber-50 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-amber-950 transition hover:bg-amber-100 disabled:opacity-50"
              >
                {photoSyncBusy ? "Uploading photos…" : "Upload map photos to journal"}
              </button>
            </>
          ) : (
            <Link
              href="/login?next=/map-maker"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-bold uppercase tracking-[0.1em] text-asphalt transition hover:border-asphalt/30"
            >
              Sign in to sync
            </Link>
          )}
        </div>
      </div>

      {session && travelerUsername ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm">
          <span className="font-semibold text-asphalt">Your pages:</span>
          <Link
            href={`/travelers/${travelerUsername}`}
            className="rounded-full bg-white px-4 py-1.5 font-semibold text-amber-900 ring-1 ring-amber-300/60 transition hover:bg-amber-100"
          >
            Public traveler map →
          </Link>
          <Link href="/dashboard" className="rounded-full px-4 py-1.5 font-semibold text-asphalt/80 underline-offset-4 hover:text-asphalt">
            Dashboard
          </Link>
          <Link href="/dashboard/edit" className="rounded-full px-4 py-1.5 font-semibold text-asphalt/80 underline-offset-4 hover:text-asphalt">
            Edit profile
          </Link>
        </div>
      ) : null}

      {syncMessage ? (
        <p
          className={
            syncMessageOk
              ? "mb-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900"
              : "mb-3 rounded-2xl border border-rose-200 bg-rose-50/95 px-4 py-3 text-sm text-rose-950"
          }
        >
          {syncMessage}
        </p>
      ) : null}

      <p className="mb-2 text-center text-xs leading-relaxed text-asphalt/55 sm:text-left sm:text-sm">
        <span className="font-semibold text-asphalt/75">Accepted photos:</span> JPEG, PNG, WebP, GIF, and iPhone HEIC/HEIF (we try to
        convert HEIC on our server). If an iPhone photo won&apos;t upload, export it as JPEG from the Photos app first, then try again.
      </p>

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:rounded-2xl">
        <iframe
          ref={iframeRef}
          src="/map-maker.html"
          className="block h-[calc(100dvh-8.5rem)] min-h-[420px] w-full border-0 sm:h-[78dvh] sm:min-h-[600px] lg:h-[82dvh] xl:h-[85dvh] xl:max-h-[1100px]"
          title="50 State Photo Map Maker"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
