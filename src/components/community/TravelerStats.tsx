import type { TravelerProfile } from "@/lib/community/types";

const statItems = (profile: TravelerProfile) => [
  {
    label: "States visited",
    value: profile.statesVisited,
    accent: "from-emerald-400/30 to-emerald-200/5",
    tone: "text-emerald-950",
    detail: "Miles that turned into memories",
  },
  {
    label: "States lived",
    value: profile.statesLived,
    accent: "from-sky-400/30 to-sky-200/5",
    tone: "text-sky-950",
    detail: "Places that became home for a while",
  },
  {
    label: "Capitals",
    value: profile.capitalsVisited,
    accent: "from-violet-400/30 to-violet-200/5",
    tone: "text-violet-950",
    detail: "Stops with a civic heartbeat",
  },
  {
    label: "Capitol buildings",
    value: profile.capitolBuildingsVisited,
    accent: "from-amber-400/30 to-amber-200/5",
    tone: "text-amber-950",
    detail: "Architecture worth slowing down for",
  },
  {
    label: "National parks",
    value: profile.nationalParksVisited,
    accent: "from-rose-400/30 to-rose-200/5",
    tone: "text-rose-950",
    detail: "Big landscape days in the archive",
  },
];

export default function TravelerStats({ profile }: { profile: TravelerProfile }) {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.04),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.35),transparent_40%)]" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Journey numbers</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.35rem]">
            Field notes, not dashboard stats.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-asphalt/60 lg:text-right">
          Each number is treated like part of the collection — less widget grid, more printed ledger of what the road has already given back.
        </p>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statItems(profile).map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.9rem] border border-slate-200/80 bg-gradient-to-br ${item.accent} p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-asphalt/46">{item.label}</p>
            <p className={`mt-5 text-5xl font-black tracking-[-0.06em] ${item.tone}`}>{item.value}</p>
            <p className="mt-4 text-sm leading-6 text-asphalt/62">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
