"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getStateSlug, type State } from "@/lib/states";

export default function ExploreStates({ states }: { states: State[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return states;
    return states.filter(
      (s) =>
        s.name.toLowerCase().includes(t) ||
        s.code.toLowerCase().includes(t) ||
        s.nickname.toLowerCase().includes(t) ||
        s.region.toLowerCase().includes(t)
    );
  }, [states, q]);

  return (
    <div>
      <label className="sr-only" htmlFor="explore-filter">
        Filter states
      </label>
      <input
        id="explore-filter"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Type a state, abbreviation, or region…"
        className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-asphalt shadow-sm outline-none ring-amber-200/50 transition focus:border-amber-300 focus:ring-4"
        autoComplete="off"
      />
      <p className="mt-3 text-sm text-asphalt/50">
        Showing {filtered.length} of {states.length} states
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <li key={s.code}>
            <Link
              href={`/states/${getStateSlug(s)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm font-semibold text-asphalt transition hover:border-amber-200 hover:bg-white hover:shadow-md"
            >
              <span>{s.name}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-asphalt/40">{s.code}</span>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-asphalt/55">No matches — try another spelling.</p>
      ) : null}
    </div>
  );
}
