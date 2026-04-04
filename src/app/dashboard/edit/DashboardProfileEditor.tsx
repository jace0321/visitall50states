"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { STATE_NAMES } from "@/lib/states";
import type { TravelStyle } from "@/lib/community/types";

type ProfileFormState = {
  displayName: string;
  bio: string;
  homeState: string;
  travelStyle: TravelStyle;
  travelingWith: string;
  currentRouteLabel: string;
  northStar: string;
  nextTargets: string;
  routeHighlights: string;
  isPublic: boolean;
  featuredState: string;
};

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  home_state: string | null;
  travel_style: TravelStyle | null;
  traveling_with: string | null;
  current_route_label: string | null;
  north_star: string | null;
  next_targets: string[] | null;
  route_highlights: string[] | null;
  is_public: boolean | null;
  featured_state: string | null;
};

const TRAVEL_STYLE_OPTIONS: Array<{ value: TravelStyle; label: string; blurb: string }> = [
  { value: "family", label: "Family", blurb: "Built for road trips with the crew." },
  { value: "solo", label: "Solo", blurb: "One traveler, all the miles." },
  { value: "couple", label: "Couple", blurb: "Shared route, shared memories." },
  { value: "rv", label: "RV", blurb: "Rolling basecamp, long-haul comfort." },
  { value: "motorcycle", label: "Motorcycle", blurb: "Lean, loud, and earned the hard way." },
  { value: "van-life", label: "Van life", blurb: "Home moves when you do." },
];

function defaultForm(): ProfileFormState {
  return {
    displayName: "",
    bio: "",
    homeState: "",
    travelStyle: "family",
    travelingWith: "",
    currentRouteLabel: "",
    northStar: "",
    nextTargets: "",
    routeHighlights: "",
    isPublic: false,
    featuredState: "",
  };
}

function toTextareaValue(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function toStringArray(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function deriveBaseUsername(email?: string | null, displayName?: string | null, userId?: string) {
  const emailBase = email?.split("@")[0]?.trim();
  const displayBase = displayName?.trim();
  const rawBase = emailBase || displayBase || "traveler";
  const base = slugify(rawBase).slice(0, 24) || "traveler";
  const suffix = userId?.replace(/-/g, "").slice(0, 6) ?? "road";
  return `${base}-${suffix}`;
}

function formFromRow(row: ProfileRow): ProfileFormState {
  return {
    displayName: row.display_name ?? "",
    bio: row.bio ?? "",
    homeState: row.home_state ?? "",
    travelStyle: row.travel_style ?? "family",
    travelingWith: row.traveling_with ?? "",
    currentRouteLabel: row.current_route_label ?? "",
    northStar: row.north_star ?? "",
    nextTargets: toTextareaValue(row.next_targets),
    routeHighlights: toTextareaValue(row.route_highlights),
    isPublic: row.is_public ?? false,
    featuredState: row.featured_state ?? "",
  };
}

export default function DashboardProfileEditor() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [form, setForm] = useState<ProfileFormState>(() => defaultForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) {
            setSignedIn(false);
            setProfileExists(false);
            setUsername(null);
            setUserEmail(null);
            setForm(defaultForm());
            setError("Sign in first to load your live traveler profile.");
            setLoading(false);
          }
          return;
        }

        const nextEmail = session.user.email ?? null;
        const fallbackName =
          (typeof session.user.user_metadata?.display_name === "string" && session.user.user_metadata.display_name) ||
          (typeof session.user.user_metadata?.full_name === "string" && session.user.user_metadata.full_name) ||
          null;

        const { data: profile, error: profileError } = await supabase
          .from("traveler_profiles")
          .select(
            "id, username, display_name, bio, home_state, travel_style, traveling_with, current_route_label, north_star, next_targets, route_highlights, is_public, featured_state"
          )
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!cancelled) {
          setSignedIn(true);
          setUserEmail(nextEmail);

          if (profile) {
            setProfileExists(true);
            setUsername(profile.username);
            setForm(formFromRow(profile as ProfileRow));
          } else {
            setProfileExists(false);
            setUsername(deriveBaseUsername(nextEmail, fallbackName, session.user.id));
            setForm({
              ...defaultForm(),
              displayName: fallbackName ?? "",
            });
          }

          setLoading(false);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Couldn’t load your traveler profile yet.");
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  function update<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function ensureProfile(userId: string, email?: string | null) {
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("traveler_profiles")
      .select("id, username")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfileError) {
      throw existingProfileError;
    }

    if (existingProfile?.id) {
      return existingProfile;
    }

    const displaySeed = form.displayName.trim() || null;
    const baseUsername = deriveBaseUsername(email, displaySeed, userId);
    const candidates = [baseUsername, `${baseUsername}-1`, `${baseUsername}-2`, `${baseUsername}-3`];

    for (const candidate of candidates) {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("traveler_profiles")
        .insert({
          user_id: userId,
          username: candidate,
          display_name: displaySeed,
          bio: form.bio.trim() || null,
          home_state: form.homeState || null,
          travel_style: form.travelStyle,
          traveling_with: form.travelingWith.trim() || null,
          current_route_label: form.currentRouteLabel.trim() || null,
          north_star: form.northStar.trim() || null,
          next_targets: toStringArray(form.nextTargets),
          route_highlights: toStringArray(form.routeHighlights),
          is_public: form.isPublic,
          featured_state: form.featuredState || null,
        })
        .select("id, username")
        .single();

      if (!insertError && insertedProfile) {
        return insertedProfile;
      }

      if (insertError && !/duplicate key value|unique constraint/i.test(insertError.message)) {
        throw insertError;
      }
    }

    throw new Error("Couldn’t reserve a public username for your traveler profile. Try saving again.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("You need to be signed in to save your traveler profile.");
      }

      const profile = await ensureProfile(session.user.id, session.user.email ?? userEmail);
      const payload = {
        display_name: form.displayName.trim() || null,
        bio: form.bio.trim() || null,
        home_state: form.homeState || null,
        travel_style: form.travelStyle,
        traveling_with: form.travelingWith.trim() || null,
        current_route_label: form.currentRouteLabel.trim() || null,
        north_star: form.northStar.trim() || null,
        next_targets: toStringArray(form.nextTargets),
        route_highlights: toStringArray(form.routeHighlights),
        is_public: form.isPublic,
        featured_state: form.featuredState || null,
      };

      const { error: updateError } = await supabase.from("traveler_profiles").update(payload).eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      setProfileExists(true);
      setUsername(profile.username);
      setMessage(
        form.isPublic
          ? `Profile saved. Your public traveler page is ready at /travelers/${profile.username}.`
          : "Profile saved. Flip the public toggle whenever you’re ready to share it."
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn’t save your traveler profile.");
    } finally {
      setSaving(false);
    }
  }

  const nextTargetsCount = toStringArray(form.nextTargets).length;
  const routeHighlightsCount = toStringArray(form.routeHighlights).length;

  return (
    <>
      <section className="rounded-[2.5rem] border border-white/60 bg-[#07111f] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.30)] lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/48">Profile editor</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Shape the traveler page people actually see.</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
              This editor is now wired to your real Supabase session and your actual <code className="rounded bg-white/10 px-2 py-1 text-sm">traveler_profiles</code> row.
              Save here, then open the public page and verify it instantly.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-white/12 bg-white/8 px-5 py-4 text-sm text-white/78">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Public handle</p>
            <p className="mt-2 text-lg font-bold text-white">{username ? `@${username}` : "Will be created on first save"}</p>
            <p className="mt-2 text-white/58">{profileExists ? "Existing traveler profile found." : "No row yet — first save will create it."}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_22rem]">
        <form onSubmit={handleSubmit} className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Traveler voice</p>
              <p className="mt-2 text-sm text-asphalt/62">Load, edit, and save the profile fields that power your public traveler page.</p>
            </div>
            {username ? (
              <Link
                href={`/travelers/${username}`}
                className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-sm font-semibold text-asphalt/75 transition hover:border-asphalt/20 hover:text-asphalt"
              >
                Preview public profile →
              </Link>
            ) : null}
          </div>

          {!signedIn && !loading ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
              Sign in to test this with your live Supabase session. Once signed in, this page will load your row by <code>user_id</code> and save updates back to <code>traveler_profiles</code>.
            </div>
          ) : null}

          {loading ? (
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-cloud px-5 py-4 text-sm text-asphalt/60">Loading your traveler profile…</div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Display name">
                  <input
                    value={form.displayName}
                    onChange={(event) => update("displayName", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder="Jace Earp"
                  />
                </Field>
                <Field label="Travel style">
                  <select
                    value={form.travelStyle}
                    onChange={(event) => update("travelStyle", event.target.value as TravelStyle)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                  >
                    {TRAVEL_STYLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Home state">
                  <select
                    value={form.homeState}
                    onChange={(event) => update("homeState", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                  >
                    <option value="">Select your home base</option>
                    {STATE_NAMES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Featured state">
                  <select
                    value={form.featuredState}
                    onChange={(event) => update("featuredState", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                  >
                    <option value="">No featured state yet</option>
                    {STATE_NAMES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Traveling with">
                  <input
                    value={form.travelingWith}
                    onChange={(event) => update("travelingWith", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder="My 3 boys, good coffee, and a loud bike"
                  />
                </Field>
                <Field label="Current route label">
                  <input
                    value={form.currentRouteLabel}
                    onChange={(event) => update("currentRouteLabel", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder="Still here. Still moving."
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Bio">
                  <textarea
                    value={form.bio}
                    onChange={(event) => update("bio", event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder="What kind of traveler are you, and what makes your map yours?"
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="North star">
                  <textarea
                    value={form.northStar}
                    onChange={(event) => update("northStar", event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder="The bigger reason behind the miles. This feeds the public journey summary."
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Next targets">
                  <textarea
                    value={form.nextTargets}
                    onChange={(event) => update("nextTargets", event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder={"Write one per line\nTennessee\nArizona\nMaine"}
                  />
                </Field>
                <Field label="Route highlights">
                  <textarea
                    value={form.routeHighlights}
                    onChange={(event) => update("routeHighlights", event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-brand focus:ring-2 focus:ring-amber-brand/25"
                    placeholder={"Write one per line\nBadlands sunrise\nRoute 66 stretch\nBig Sky backroads"}
                  />
                </Field>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4 text-sm text-asphalt/64">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">Array preview</span>
                    <p className="mt-2">{nextTargetsCount} next target{nextTargetsCount === 1 ? "" : "s"} • {routeHighlightsCount} route highlight{routeHighlightsCount === 1 ? "" : "s"}</p>
                  </div>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-asphalt/78">
                    <input type="checkbox" checked={form.isPublic} onChange={(event) => update("isPublic", event.target.checked)} />
                    Make my traveler profile public
                  </label>
                </div>
              </div>

              {message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
              {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || loading || !signedIn}
                  className="rounded-full bg-night px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-night/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : profileExists ? "Save profile" : "Create and save profile"}
                </button>
                <Link href="/dashboard" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-asphalt/72 transition hover:border-asphalt/20 hover:text-asphalt">
                  Back to dashboard
                </Link>
                {username ? (
                  <Link href={`/travelers/${username}`} className="rounded-full border border-slate-200 bg-cloud px-6 py-3 text-sm font-semibold text-asphalt/72 transition hover:border-asphalt/20 hover:text-asphalt">
                    Open public page
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">What this saves</p>
            <div className="mt-4 space-y-3">
              <StudioRow label="display_name" value={form.displayName || "—"} />
              <StudioRow label="travel_style" value={TRAVEL_STYLE_OPTIONS.find((option) => option.value === form.travelStyle)?.label ?? form.travelStyle} />
              <StudioRow label="is_public" value={form.isPublic ? "true" : "false"} />
              <StudioRow label="featured_state" value={form.featuredState || "—"} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-[#f4efe5] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-asphalt/42">Travel style guide</p>
            <div className="mt-4 space-y-3">
              {TRAVEL_STYLE_OPTIONS.map((option) => (
                <div key={option.value} className={`rounded-[1.25rem] border px-4 py-3 ${form.travelStyle === option.value ? "border-asphalt/15 bg-white" : "border-asphalt/8 bg-white/55"}`}>
                  <p className="text-sm font-bold text-asphalt">{option.label}</p>
                  <p className="mt-1 text-sm leading-6 text-asphalt/62">{option.blurb}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-asphalt/42">Browser test checklist</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-asphalt/66">
              <li>1. Sign in with your app account.</li>
              <li>2. Open <code>/dashboard/edit</code>.</li>
              <li>3. Change a few fields and save.</li>
              <li>4. If public is enabled, open the public traveler page and verify the updates render.</li>
            </ul>
            {userEmail ? <p className="mt-4 text-xs text-asphalt/48">Session email: {userEmail}</p> : null}
          </div>
        </aside>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">{label}</span>
      {children}
    </label>
  );
}

function StudioRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-asphalt/10 bg-white px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</span>
      <span className="text-right text-sm font-semibold text-asphalt/84">{value}</span>
    </div>
  );
}
