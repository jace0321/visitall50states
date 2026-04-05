"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { STATE_NAMES } from "@/lib/states";
import US_STATE_PATHS from "@/lib/us-map-paths";
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

function buildEmptyItems(): StateListItem[] {
  return STATE_NAMES.map((name) => {
    const code = STATE_CODE_BY_NAME.get(name) ?? name.slice(0, 2).toUpperCase();
    return {
      code,
      name,
      hasEntry: false,
      status: "not_visited",
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
  const emptyItems = useMemo(() => buildEmptyItems(), []);
  const [state, setState] = useState<SummaryState>({
    loading: true,
    modeLabel: "Checking your saved atlas…",
    items: emptyItems,
    entriesCount: 0,
    visitedCount: 0,
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
            modeLabel: "Configure Supabase to load entries",
            items: emptyItems,
            entriesCount: 0,
            visitedCount: 0,
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
              modeLabel: "Sign in to load your state entries",
              items: emptyItems,
              entriesCount: 0,
              visitedCount: 0,
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
              modeLabel: "Create your traveler profile to unlock entries",
              items: emptyItems,
              entriesCount: 0,
              visitedCount: 0,
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
            modeLabel: "Could not load entries",
            items: emptyItems,
            entriesCount: 0,
            visitedCount: 0,
          });
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [emptyItems]);

  const readyItems = state.items.filter((item) => item.hasEntry);
  const suggestedItems = state.items.filter((item) => !item.hasEntry && (item.status === "visited" || item.status === "lived")).slice(0, 6);

  const [filter, setFilter] = useState("");
  const q = filter.trim().toLowerCase();
  const filteredItems = q
    ? state.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q)
      )
    : state.items;

  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">State journals</p>
          <h2 className="mt-2 font-heading text-xl font-extrabold tracking-[-0.04em] text-asphalt sm:text-2xl">
            Search or open a state
          </h2>
        </div>
        <p className="max-w-md text-sm text-asphalt/55">
          Use the map above for quick access; this list is for search and a compact overview.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryTile label="With entries" value={`${state.entriesCount}`} sublabel="saved" />
        <SummaryTile label="Visited (map)" value={`${state.visitedCount}`} sublabel="states" />
        <SummaryTile label="Status" value={state.loading ? "…" : state.modeLabel} sublabel="data" />
      </div>

      <label className="mt-5 block">
        <span className="sr-only">Filter states</span>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or code (e.g. MO, Missouri)"
          className="w-full rounded-2xl border border-asphalt/12 bg-white px-4 py-3 text-sm text-asphalt shadow-inner outline-none ring-amber-200/0 transition focus:border-amber-300/80 focus:ring-2 focus:ring-amber-200/60"
        />
      </label>

      {suggestedItems.length > 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-amber-200/70 bg-[#fdf7ea] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800/70">Visited on map, no entry yet</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedItems.map((item) => (
              <Link
                key={item.code}
                href={`/dashboard/state/${item.code}`}
                className="rounded-full border border-amber-300/70 bg-white px-3 py-1.5 text-sm font-semibold text-asphalt hover:shadow-sm"
              >
                {item.code}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {readyItems.length > 0 ? (
        <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-asphalt/45">Has entry — edit</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {readyItems.slice(0, 12).map((item) => (
              <Link
                key={item.code}
                href={`/dashboard/state/${item.code}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-asphalt hover:shadow-sm"
              >
                {item.code}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-[#fbfaf7]">
        <div className="max-h-[min(22rem,50vh)] overflow-auto">
          <table className="w-full min-w-[280px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-[#f0ebe3] text-[10px] font-semibold uppercase tracking-[0.18em] text-asphalt/55">
              <tr>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5">State</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const meta = statusMeta(item.status, item.hasEntry);
                return (
                  <tr key={item.code} className="border-t border-slate-200/80 bg-white/50 hover:bg-white">
                    <td className="px-3 py-2 font-bold text-asphalt">{item.code}</td>
                    <td className="px-3 py-2 text-asphalt/85">{item.name}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${meta.tone}`}>
                        {meta.pill}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/dashboard/state/${item.code}`} className="font-semibold text-amber-900 hover:underline">
                        {meta.action}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
