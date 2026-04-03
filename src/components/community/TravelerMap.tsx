import Link from "next/link";
import type { TravelerMapState } from "@/lib/community/types";

function statusClasses(status: TravelerMapState["status"]) {
  switch (status) {
    case "visited":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "lived":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "want_to_go":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

export default function TravelerMap({ username, states }: { username: string; states: TravelerMapState[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Clickable journey map</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-asphalt">State-by-state dashboard</h2>
        <p className="mt-2 text-asphalt/60">MVP scaffold: each state links to that traveler&apos;s personal page for the state.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {states.map((state) => (
          <Link
            key={state.name}
            href={`/travelers/${username}/${state.name.toLowerCase().replace(/\s+/g, "-")}`}
            className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${statusClasses(state.status)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{state.name}</span>
              {state.hasStory ? <span>📝</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
