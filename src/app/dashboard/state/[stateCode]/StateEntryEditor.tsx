"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StateEntryMediaManager from "@/components/dashboard/StateEntryMediaManager";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { STATE_NAMES } from "@/lib/states";
import type { TravelerStateMediaTableRow } from "@/lib/traveler-state-media";

type EditorState = {
  stateCode: string;
  stateName: string;
  title: string;
  summary: string;
  story: string;
  favoriteMemory: string;
  bestStop: string;
  hiddenGem: string;
  bestFood: string;
  rating: string;
  dateVisited: string;
  cityRegion: string;
  familyFriendly: boolean;
  worthDetour: boolean;
};

type LegacyPhoto = {
  url?: string;
  caption?: string;
};

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function defaultForm(stateCode: string) {
  const stateName = STATE_NAMES.find((name) => name.slice(0, 2).toUpperCase() === stateCode.toUpperCase()) ?? stateCode.toUpperCase();

  return {
    stateCode: stateCode.toUpperCase(),
    stateName,
    title: "",
    summary: "",
    story: "",
    favoriteMemory: "",
    bestStop: "",
    hiddenGem: "",
    bestFood: "",
    rating: "5",
    dateVisited: "",
    cityRegion: "",
    familyFriendly: true,
    worthDetour: true,
  } satisfies EditorState;
}

export default function StateEntryEditor({ stateCode }: { stateCode: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [form, setForm] = useState<EditorState>(() => defaultForm(stateCode));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [legacyPhotos, setLegacyPhotos] = useState<LegacyPhoto[]>([]);
  const [mediaItems, setMediaItems] = useState<TravelerStateMediaTableRow[]>([]);
  const [travelerUsername, setTravelerUsername] = useState<string | null>(null);
  const [travelerProfileId, setTravelerProfileId] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEntry() {
      setLoading(true);
      setError(null);
      setMessage(null);
      setExistingEntryId(null);
      setLegacyPhotos([]);
      setMediaItems([]);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) {
          setError("You need to be signed in to edit traveler entries.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setSessionUserId(session.user.id);
      }

      const { data: profile, error: profileError } = await supabase
        .from("traveler_profiles")
        .select("id, username")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileError || !profile?.id) {
        if (!cancelled) {
          setError("Couldn’t find your traveler profile yet. Make sure your public traveler profile exists first.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        const pid = profile.id as string;
        const uname =
          typeof (profile as { username?: unknown }).username === "string"
            ? (profile as { username: string }).username
            : null;
        setTravelerProfileId(pid);
        setTravelerUsername(uname);
      }

      const { data: entry, error: entryError } = await supabase
        .from("traveler_state_entries")
        .select("id, state_code, state_name, title, summary, story, favorite_memory, best_stop, hidden_gem, best_food, rating, date_visited, city_region, family_friendly, worth_detour, photos")
        .eq("traveler_profile_id", profile.id)
        .eq("state_code", stateCode.toUpperCase())
        .maybeSingle();

      if (entryError && entryError.code !== "PGRST116") {
        if (!cancelled) {
          setError("Couldn’t load this state entry yet.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        if (entry) {
          setExistingEntryId(entry.id);
          setLegacyPhotos(Array.isArray(entry.photos) ? entry.photos : []);
          setForm({
            stateCode: entry.state_code,
            stateName: entry.state_name,
            title: entry.title ?? "",
            summary: entry.summary ?? "",
            story: entry.story ?? "",
            favoriteMemory: entry.favorite_memory ?? "",
            bestStop: entry.best_stop ?? "",
            hiddenGem: entry.hidden_gem ?? "",
            bestFood: entry.best_food ?? "",
            rating: String(entry.rating ?? 5),
            dateVisited: entry.date_visited ?? "",
            cityRegion: entry.city_region ?? "",
            familyFriendly: entry.family_friendly ?? true,
            worthDetour: entry.worth_detour ?? true,
          });
        } else {
          setForm(defaultForm(stateCode));
        }
      }

      if (entry?.id) {
        const { data: mediaRows, error: mediaError } = await supabase
          .from("traveler_state_media")
          .select("id, media_kind, public_url, storage_path, poster_url, caption, alt_text, sort_order, is_featured")
          .eq("traveler_state_entry_id", entry.id)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });

        if (!cancelled) {
          if (mediaError) {
            setError("State entry loaded, but structured media could not be loaded yet.");
          } else {
            setMediaItems((mediaRows as TravelerStateMediaTableRow[] | null) ?? []);
          }
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadEntry();

    return () => {
      cancelled = true;
    };
  }, [stateCode, supabase]);

  const refreshMediaForEntry = useCallback(
    async (entryId: string) => {
      const { data: mediaRows, error: mediaError } = await supabase
        .from("traveler_state_media")
        .select("id, media_kind, public_url, storage_path, poster_url, caption, alt_text, sort_order, is_featured")
        .eq("traveler_state_entry_id", entryId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (!mediaError && mediaRows) {
        setMediaItems((mediaRows as TravelerStateMediaTableRow[]) ?? []);
      }
    },
    [supabase]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setError("You need to be signed in to save.");
      setSaving(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("traveler_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileError || !profile?.id) {
      setError("Couldn’t find your traveler profile.");
      setSaving(false);
      return;
    }

    const payload = {
      traveler_profile_id: profile.id,
      state_code: form.stateCode,
      state_name: form.stateName,
      slug: slugify(form.stateName),
      status: "visited",
      title: form.title.trim(),
      summary: form.summary.trim(),
      story: form.story.trim(),
      favorite_memory: form.favoriteMemory.trim(),
      best_stop: form.bestStop.trim(),
      hidden_gem: form.hiddenGem.trim(),
      best_food: form.bestFood.trim(),
      rating: Number(form.rating || 0),
      date_visited: form.dateVisited || null,
      city_region: form.cityRegion.trim(),
      family_friendly: form.familyFriendly,
      worth_detour: form.worthDetour,
      photos: legacyPhotos,
      comments: [],
    };

    const { data: existingEntry, error: existingEntryError } = await supabase
      .from("traveler_state_entries")
      .select("id")
      .eq("traveler_profile_id", profile.id)
      .eq("state_code", form.stateCode)
      .maybeSingle();

    if (existingEntryError && existingEntryError.code !== "PGRST116") {
      setError(existingEntryError.message);
      setSaving(false);
      return;
    }

    const saveQuery = existingEntry?.id
      ? supabase.from("traveler_state_entries").update(payload).eq("id", existingEntry.id).select("id").single()
      : supabase.from("traveler_state_entries").insert(payload).select("id").single();

    const { data: savedRow, error: saveError } = await saveQuery;

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    const resolvedId = (savedRow as { id?: string } | null)?.id ?? existingEntry?.id ?? existingEntryId;
    if (resolvedId) {
      setExistingEntryId(resolvedId);
      await refreshMediaForEntry(resolvedId);
    }

    setMessage(`Saved ${form.stateName}. Your public journal page updates right away; add photos below whenever you are ready.`);
    setSaving(false);
  }

  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const structuredPhotoCount = mediaItems.filter((m) => m.media_kind === "photo").length;
  const structuredVideoCount = mediaItems.filter((m) => m.media_kind === "video").length;
  const structuredMediaTotal = structuredPhotoCount + structuredVideoCount;
  const totalMediaCount = structuredMediaTotal > 0 ? structuredMediaTotal : legacyPhotos.length;

  return (
    <>
      <section className="rounded-[2.5rem] border border-white/60 bg-[#07111f] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.30)] lg:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/48">State editor</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">{form.stateName} story workspace</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          This is the first real authoring layer for traveler pages. Fill in one state, save it, and it becomes a live public journal page.
        </p>
      </section>

      <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Entry controls</p>
            <p className="mt-2 text-sm text-asphalt/62">Save one state at a time, then check it live on your public page.</p>
          </div>
          {travelerUsername ? (
            <Link
              href={`/travelers/${travelerUsername}/${slugify(form.stateName)}`}
              className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-sm font-semibold text-asphalt/75 transition hover:border-asphalt/20 hover:text-asphalt"
            >
              Preview public page →
            </Link>
          ) : (
            <span className="rounded-full border border-dashed border-slate-200 bg-cloud px-4 py-2 text-sm text-asphalt/45">
              Preview after profile has a username
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-cloud px-5 py-4 text-sm text-asphalt/60">Loading editor…</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="State code">
                <input value={form.stateCode} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </Field>
              <Field label="State name">
                <input value={form.stateName} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </Field>
              <Field label="Date visited">
                <input type="date" value={form.dateVisited} onChange={(e) => update("dateVisited", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
              <Field label="Rating">
                <input type="number" min="1" max="5" value={form.rating} onChange={(e) => update("rating", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input value={form.title} onChange={(e) => update("title", e.target.value)} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
              <Field label="Region / city">
                <input value={form.cityRegion} onChange={(e) => update("cityRegion", e.target.value)} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
            </div>

            <Field label="Summary">
              <textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} required rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            </Field>

            <Field label="Story">
              <textarea value={form.story} onChange={(e) => update("story", e.target.value)} required rows={8} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Favorite memory">
                <textarea value={form.favoriteMemory} onChange={(e) => update("favoriteMemory", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
              <Field label="Best stop">
                <textarea value={form.bestStop} onChange={(e) => update("bestStop", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
              <Field label="Hidden gem">
                <textarea value={form.hiddenGem} onChange={(e) => update("hiddenGem", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
              <Field label="Best food">
                <textarea value={form.bestFood} onChange={(e) => update("bestFood", e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              </Field>
            </div>

            <section className="rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7] p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">State media</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-asphalt">Photos &amp; video from the road</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-asphalt/66">
                  Uploads go to your Supabase bucket and appear on your public state journal. Mark one item as the cover — it leads the page hero and map inset (use a photo cover if you want a still on the map).
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MediaStat label="Photos" value={`${structuredPhotoCount}`} />
                <MediaStat label="Videos" value={`${structuredVideoCount}`} />
                <MediaStat label="Legacy JSON photos" value={`${legacyPhotos.length}`} />
                <MediaStat label="Shown on public page" value={`${totalMediaCount}`} />
              </div>

              {travelerProfileId && sessionUserId ? (
                <StateEntryMediaManager
                  supabase={supabase}
                  travelerProfileId={travelerProfileId}
                  userId={sessionUserId}
                  stateEntryId={existingEntryId}
                  mediaItems={mediaItems}
                  legacyPhotoCount={legacyPhotos.length}
                  onMediaChange={async () => {
                    if (existingEntryId) await refreshMediaForEntry(existingEntryId);
                  }}
                  stateLabel={form.stateName}
                />
              ) : (
                <p className="mt-4 text-sm text-asphalt/55">Sign in and load your profile to manage uploads.</p>
              )}

              {legacyPhotos.length > 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800/80">Legacy photos on this entry</p>
                  <p className="mt-2 text-sm leading-7 text-asphalt/68">
                    {legacyPhotos.length} older JSON photo{legacyPhotos.length === 1 ? "" : "s"} still merge into the public gallery when no structured uploads exist.
                    Re-upload here to use captions, cover selection, and storage-backed URLs.
                  </p>
                </div>
              ) : null}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-cloud px-4 py-3 text-sm font-semibold text-asphalt/72">
                <input type="checkbox" checked={form.familyFriendly} onChange={(e) => update("familyFriendly", e.target.checked)} />
                Family friendly
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-cloud px-4 py-3 text-sm font-semibold text-asphalt/72">
                <input type="checkbox" checked={form.worthDetour} onChange={(e) => update("worthDetour", e.target.checked)} />
                Worth the detour
              </label>
            </div>

            {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving || loading} className="rounded-full bg-night px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-night/90 disabled:opacity-60">
                {saving ? "Saving..." : "Save state entry"}
              </button>
              {travelerUsername ? (
                <Link
                  href={`/travelers/${travelerUsername}`}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-asphalt/72 transition hover:border-asphalt/20 hover:text-asphalt"
                >
                  Back to traveler page
                </Link>
              ) : (
                <Link href="/dashboard" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-asphalt/72 transition hover:border-asphalt/20 hover:text-asphalt">
                  Back to dashboard
                </Link>
              )}
            </div>
          </form>
        )}
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">{label}</span>
      {children}
    </label>
  );
}

function MediaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-asphalt">{value}</p>
    </div>
  );
}
