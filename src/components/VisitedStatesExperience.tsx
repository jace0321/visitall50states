"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { STATE_NAMES } from "@/lib/states";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const STORAGE_KEY = "visitall50states:visited";
const HERO_STATES = ["Texas", "Arizona", "Colorado", "Tennessee", "Florida", "Montana"];
const SUGGESTED_ROUTES = [
  "Tennessee",
  "Kentucky",
  "Colorado",
  "Arizona",
  "Florida",
  "Montana",
  "California",
  "Maine",
];
const MILESTONE_COPY = [
  { min: 0, title: "The map is waiting.", text: "Start with one state and the whole thing begins to feel possible." },
  { min: 5, title: "Now it feels like a mission.", text: "You’ve got enough miles behind you to taste momentum." },
  { min: 15, title: "Real road-family territory.", text: "This is where the stories start stacking up fast." },
  { min: 30, title: "You’re building a legend.", text: "At this point the map stops being a wish and starts becoming proof." },
  { min: 45, title: "Finish-line energy.", text: "You can see the whole country bending toward the endgame now." },
];

export default function VisitedStatesExperience() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [visitedStates, setVisitedStates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function loadVisitedStates() {
      if (session?.user) {
        const { data, error } = await supabase
          .from("users_maps")
          .select("states_visited")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setSyncStatus("error");
          setSyncMessage("Couldn’t load your saved states yet. Falling back to local preview.");
        }

        const dbStates = Array.isArray(data?.states_visited)
          ? data.states_visited.filter((value): value is string => typeof value === "string")
          : null;

        if (dbStates) {
          setVisitedStates(dbStates);
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dbStates));
        } else {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                setVisitedStates(parsed.filter((value): value is string => typeof value === "string"));
              }
            } catch {
              // ignore invalid local data
            }
          }
        }
      } else {
        try {
          const saved = window.localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setVisitedStates(parsed.filter((value): value is string => typeof value === "string"));
            }
          } else {
            setVisitedStates([]);
          }
        } catch {
          setVisitedStates([]);
        }
      }

      setLoaded(true);
    }

    loadVisitedStates();

    return () => {
      cancelled = true;
    };
  }, [authReady, session, supabase]);

  useEffect(() => {
    if (!loaded) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedStates));

    if (!session?.user) {
      setSyncStatus("idle");
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSyncStatus("saving");
      setSyncMessage("Saving your map...");

      const { error } = await supabase.from("users_maps").upsert(
        {
          user_id: session.user.id,
          states_visited: visitedStates,
        },
        { onConflict: "user_id" }
      );

      if (error) {
        setSyncStatus("error");
        setSyncMessage("We hit a save problem. Your browser still has the latest version.");
        return;
      }

      setSyncStatus("saved");
      setSyncMessage("Saved to your account.");
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [loaded, session, supabase, visitedStates]);

  const visitedSet = useMemo(() => new Set(visitedStates), [visitedStates]);
  const percentage = Math.round((visitedStates.length / STATE_NAMES.length) * 100);
  const remaining = STATE_NAMES.length - visitedStates.length;
  const nextMilestone = Math.min(50, visitedStates.length < 10 ? 10 : visitedStates.length < 25 ? 25 : visitedStates.length < 40 ? 40 : 50);
  const nextMilestoneGap = Math.max(0, nextMilestone - visitedStates.length);
  const milestone = [...MILESTONE_COPY].reverse().find((item) => visitedStates.length >= item.min) ?? MILESTONE_COPY[0];
  const suggestedStates = SUGGESTED_ROUTES.filter((state) => !visitedSet.has(state)).slice(0, 4);

  function toggleState(name: string) {
    setVisitedStates((current) =>
      current.includes(name)
        ? current.filter((state) => state !== name)
        : [...current, name].sort((a, b) => a.localeCompare(b))
    );
  }

  function markRoadTripStarter() {
    setVisitedStates((current) => Array.from(new Set([...current, ...HERO_STATES])).sort((a, b) => a.localeCompare(b)));
  }

  function clearVisitedStates() {
    setVisitedStates([]);
  }

  const trackerLabel = session?.user ? "Account-backed tracker" : "Local preview tracker";
  const trackerDescription = session?.user
    ? "Your map now syncs to your account and still keeps a browser backup."
    : "This still saves locally in your browser until you sign in.";

  return (
    <section className="bg-night px-6 py-24 text-white">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: "url('/hero-highway-alt.jpg')" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.35),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.25),transparent_30%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-night via-night/75 to-night/35" />
            <div className="absolute right-6 top-6 z-10 hidden flex-col gap-3 md:flex">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/75 backdrop-blur">
                Road trip mode
              </div>
              <div className="max-w-[220px] rounded-3xl border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
                <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">Next milestone</p>
                <p className="text-3xl font-black text-white">{nextMilestone}</p>
                <p className="mt-1 text-sm text-white/65">
                  {nextMilestoneGap === 0 ? "You hit it. Time to chase the next one." : `${nextMilestoneGap} states away from the next bragging-rights tier.`}
                </p>
              </div>
            </div>
            <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-8 md:p-12">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-amber-brand">
                  Start your wall-worthy map
                </p>
                <h2 className="max-w-2xl text-4xl font-black leading-[0.95] sm:text-5xl md:text-6xl">
                  Track every state. Make the journey feel earned.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                  Save the states you&apos;ve conquered, see what&apos;s left, and turn your road life into a mission your whole crew can feel.
                </p>
                <div className="mt-6 inline-flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                  <span className="rounded-full bg-amber-brand/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-100">
                    {milestone.title}
                  </span>
                  <span className="text-sm text-white/75">{milestone.text}</span>
                </div>
              </div>

              <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Visited</p>
                  <p className="text-4xl font-black">{visitedStates.length}</p>
                  <p className="mt-1 text-sm text-white/60">States locked in</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Remaining</p>
                  <p className="text-4xl font-black">{remaining}</p>
                  <p className="mt-1 text-sm text-white/60">Miles still calling</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Progress</p>
                  <p className="text-4xl font-black">{percentage}%</p>
                  <p className="mt-1 text-sm text-white/60">Of the whole map</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid items-stretch gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h3 className="text-2xl font-black">Build your first streak</h3>
              <p className="mt-2 max-w-2xl text-white/65">
                Start with a few iconic road-trip states, then keep checking them off as your map gets heavier with memories.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {suggestedStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => toggleState(state)}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-amber-brand/40 hover:text-white"
                  >
                    + {state}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">Mission control</p>
                <p className="text-xl font-black">
                  {visitedStates.length === 50 ? "All 50 conquered." : `Next target: ${nextMilestone} states`}
                </p>
                <p className="mt-2 text-sm text-white/65">
                  {visitedStates.length === 50
                    ? "At that point the only move left is framing the thing."
                    : `You need ${nextMilestoneGap} more to hit the next milestone.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={markRoadTripStarter}
                  className="rounded-full bg-amber-brand px-5 py-3 font-bold text-night transition-colors hover:bg-amber-deep"
                >
                  Load road-trip starter pack
                </button>
                <Link
                  href="/map-maker"
                  className="rounded-full border border-white/15 px-5 py-3 text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  Open photo map maker
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-asphalt shadow-2xl md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-asphalt/40">{trackerLabel}</p>
              <h3 className="text-3xl font-black tracking-tight">Visited States</h3>
              <p className="mt-2 text-asphalt/60">{trackerDescription}</p>
            </div>
            <button
              onClick={clearVisitedStates}
              className="text-sm font-semibold text-asphalt/50 transition-colors hover:text-asphalt"
            >
              Reset
            </button>
          </div>

          <div className="mb-5 rounded-3xl border border-slate-200 bg-cloud p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-asphalt/45">
              {session?.user ? "Sync status" : "Best next move"}
            </p>
            {session?.user ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-asphalt/70">
                  {syncMessage ?? "Your map is tied to your account now."}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-asphalt/45">
                  {syncStatus === "saving"
                    ? "Saving"
                    : syncStatus === "saved"
                      ? "Saved"
                      : syncStatus === "error"
                        ? "Sync issue"
                        : "Ready"}
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-asphalt/70">
                  Mark what you&apos;ve already done here, then sign in once you want your map to follow you across devices.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex rounded-full bg-night px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-night/90"
                >
                  Sign in to save your map
                </Link>
              </>
            )}
          </div>

          <div className="mb-6">
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-brand via-orange-500 to-sky-brand transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-asphalt/60">
              {visitedStates.length === 0
                ? "No states marked yet — start with the one that always comes up in family stories."
                : `${visitedStates.length} down, ${remaining} to go. The map is waking up.`}
            </p>
          </div>

          <div className="grid max-h-[540px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {STATE_NAMES.map((state) => {
              const active = visitedSet.has(state);
              return (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-night bg-night text-white shadow-lg shadow-night/15"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-brand/40"
                  }`}
                >
                  <span className="mb-1 block text-xs uppercase tracking-[0.18em] opacity-50">
                    {active ? "Visited" : "Tap to add"}
                  </span>
                  <span className="font-bold leading-tight">{state}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
