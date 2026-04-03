import type { TravelerBadge } from "@/lib/community/types";

export default function BadgeStrip({ badges }: { badges: TravelerBadge[] }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Badges</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-asphalt">Milestones on the board</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <div key={badge.key} className="rounded-2xl border border-slate-200 bg-cloud p-4">
            <div className="text-3xl">{badge.icon}</div>
            <p className="mt-3 font-bold text-asphalt">{badge.name}</p>
            <p className="mt-1 text-sm text-asphalt/60">{badge.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
