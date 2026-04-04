"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { STATE_NAMES } from "@/lib/states";
import US_STATE_PATHS from "@/lib/us-map-paths";
import { demoEntries, demoMapStates } from "@/lib/community/mock-data";
import type { TravelerMapState } from "@/lib/community/types";

type StateListItem = {
  code: string;
  name: string;
  hasEntry: boolean;
  status: TravelerMapState["status"];
  title?: string;
  summary?: string;
  updatedLabel?: string;
};

type SummaryState = {
  loading: boolean;
  modeLabel: string;
  items: StateListItem[];
  entriesCount: number;
  visitedCount: number;
};

type EntryRow = {
  state_code: string;
  state_name: string;
  title: string | null;
  summary: string | null;
  status: TravelerMapState["status"] | null;
  updated_at?: string | null;
  date_visited?: string | null;
};

const STATE_CODE_BY_NAME = new Map(US_STATE_PATHS.map((state) => [state.name, state.code]));
const ENTRY_BY_CODE = new Map(demoEntries.map((entry) => [entry.stateCode, entry]));
const MAP_BY_CODE = new Map(demoMapStates.map((state) => [state.code, state]));

function buildFallbackItems(): StateListItem[] {
  return STATE_NAMES.map((name) => {
    const code = STATE_CODE_BY_NAME.get(name) ?? name.slice(0, 2).toUpperCase();
    const entry = ENTRY_BY_CODE.get(code);
    const mapState = MAP_BY_CODE.get(code);

    return {
      code,
      name,
      hasEntry: Boolean(entry),
      status: entry?.status ?? mapState?.status ?? "not_visited",
      title: entry?.title,
      summary: entry?.summary,
      updatedLabel: entry?.dateVisited ?? undefined,
    } satisfies StateListItem;
  });
}

function formatDateLabel(value?: string | null) {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function statusMeta(status: TravelerMapState["status"], hasEntry: boolean) {
  if (hasEntry) {
    return {
      pill: status === "lived" ? "Entry saved · lived" : "Entry saved",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
      action: "Edit entry",
    };
  }

  if (status === "visited" || status === "lived") {
    return {
      pill: status === "lived" ? "Map says lived here" : "Map says visited",
      tone: "border-sky-200 bg-sky-50 text-sky-700",
      action: "Create entry",
    };
  }

  if (status === "want_to_go") {
    return {
      pill: "Wishlist",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
      action: "Add notes",
    };
  }

  return {
    pill: "Not started",
    tone: "border-slate-200 bg-slate-100 text-asphalt/60",
    action: "Create entry",
  };
}

export default function DashboardStateIndex() {
  const fallbackItems = useMemo(() => buildFallbackItems(), []);
  const [state, setState] = useState<SummaryState>({
    loading: true,
    modeLabel: "Checking your saved atlas…",
    items: fallbackItems,
    entriesCount: fallbackItems.filter((item) => item.hasEntry).length,
    visitedCount: fallbackItems.filter((item) => item.status === "visited" || item.status === "lived").length,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        if (!cancelled) {
          setState({
            loading: false,
            modeLabel: "Demo atlas preview",
            items: fallbackItems,
            entriesCount: fallbackItems.filter((item) => item.hasEntry).length,
            visitedCount: fallbackItems.filter((item) => item.status === "visited" || item.status === "lived").length,
          });
        }
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (!cancelled) {
            setState({
              loading: false,
              modeLabel: "Sign in to load your live state entries",
              items: fallbackItems,
              entriesCount: fallbackItems.filter((item) => item.hasEntry).length,
              visitedCount: fallbackItems.filter((item) => item.status === "visited" || item.status === "lived").length,
            });
          }
          return;
        }

        const [{ data: profile }, { data: userMap }] = await Promise.all([
          supabase.from("traveler_profiles").select("id").eq("user_id", session.user.id).maybeSingle(),
          supabase.from("users_maps").select("states_visited").eq("user_id", session.user.id).maybeSingle(),
        ]);

        if (!profile?.id) {
          if (!cancelled) {
            setState({
              loading: false,
              modeLabel: "Create your traveler profile to unlock live entries",
              items: fallbackItems,
              entriesCount: fallbackItems.filter((item) => item.hasEntry).length,
              visitedCount: fallbackItems.filter((item) => item.status === "visited" || item.status === "lived").length,
            });
          }
          return;
        }

        const visitedStates = Array.isArray(userMap?.states_visited)
          ? userMap.states_visited.filter((value): value is string => typeof value === "string")
          : [];

        const visitedSet = new Set(visitedStates);

        const { data: entryRows } = await supabase
          .from("traveler_state_entries")
          .select("state_code, state_name, title, summary, status, updated_at, date_visited")
          .eq("traveler_profile_id", profile.id);

        const entryMap = new Map(
          ((entryRows as EntryRow[] | null) ?? []).map((entry) => [entry.state_code, entry])
        );

        const items = STATE_NAMES.map((name) => {
          const code = STATE_CODE_BY_NAME.get(name) ?? name.slice(0, 2).toUpperCase();
          const entry = entryMap.get(code);
          const status = entry?.status ?? (visitedSet.has(name) ? "visited" : "not_visited");

          return {
            code,
            name,
            hasEntry: Boolean(entry),
            status,
            title: entry?.title ?? undefined,
            summary: entry?.summary ?? undefined,
            updatedLabel: formatDateLabel(entry?.updated_at ?? entry?.date_visited),
          } satisfies StateListItem;
        });

        if (!cancelled) {
          setState({
            loading: false,
            modeLabel: "Live traveler entry status",
            items,
            entriesCount: items.filter((item) => item.hasEntry).length,
            visitedCount: items.filter((item) => item.status === "visited" || item.status === "lived").length,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            modeLabel: "Demo atlas preview",
            items: fallbackItems,
            entriesCount: fallbackItems.filter((item) => item.hasEntry).length,
            visitedCount: fallbackItems.filter((item) => item.status === "visited" || item.status === "lived").length,
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [fallbackItems]);

  const readyItems = state.items.filter((item) => item.hasEntry);
  const suggestedItems = state.items.filter((item) => !item.hasEntry && (item.status === "visited" || item.status === "lived")).slice(0, 6);

  return (
    <section className="rounded-[2.4rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">State entry flow</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.25rem]">Pick a state and write the story.</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-asphalt/60 lg:text-right">
          Every state now has a direct path into its editor. If live traveler data is available, this list shows which states already have entries and which visited states still need a story.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <SummaryTile label="States with entries" value={`${state.entriesCount}`} sublabel="ready to edit" />
        <SummaryTile label="Visited on the map" value={`${state.visitedCount}`} sublabel="live or demo status" />
        <SummaryTile label="Data source" value={state.loading ? "Loading…" : state.modeLabel} sublabel="falls back gracefully" />
      </div>

      {suggestedItems.length > 0 ? (
        <div className="mt-6 rounded-[1.8rem] border border-amber-200/70 bg-[#fdf7ea] p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800/70">Suggested next entries</p>
              <p className="mt-2 text-sm leading-7 text-asphalt/70">These states already look visited on the map but don&apos;t have a full journal entry yet.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedItems.map((item) => (
                <Link
                  key={item.code}
                  href={`/dashboard/state/${item.code}`}
                  className="rounded-full border border-amber-300/70 bg-white px-4 py-2 text-sm font-semibold text-asphalt transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {item.name} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {readyItems.length > 0 ? (
        <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7] p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">Continue editing</p>
              <p className="mt-2 text-sm leading-7 text-asphalt/66">Jump back into the states that already have a saved page.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {readyItems.slice(0, 8).map((item) => (
                <Link
                  key={item.code}
                  href={`/dashboard/state/${item.code}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-asphalt transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  Edit {item.code}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {state.items.map((item) => {
          const meta = statusMeta(item.status, item.hasEntry);

          return (
            <Link
              key={item.code}
              href={`/dashboard/state/${item.code}`}
              className="group rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{item.code}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-asphalt">{item.name}</h3>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.tone}`}>
                  {meta.pill}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-asphalt/66">
                {item.title ?? item.summary ?? "Start with the title, summary, memory, and the stop that made this state worth keeping."}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-asphalt/72 group-hover:text-asphalt">{meta.action} →</span>
                <span className="text-xs text-asphalt/45">{item.updatedLabel ? `Updated ${item.updatedLabel}` : "Open editor"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SummaryTile({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="rounded-[1.6rem] border border-asphalt/10 bg-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-asphalt">{value}</p>
      <p className="mt-2 text-sm text-asphalt/58">{sublabel}</p>
    </div>
  );
}
