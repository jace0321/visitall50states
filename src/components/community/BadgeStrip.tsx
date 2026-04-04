import type { TravelerBadge } from "@/lib/community/types";

export default function BadgeStrip({ badges }: { badges: TravelerBadge[] }) {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-[#1e293b]/10 bg-[#f6f1e7] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.3),transparent_42%)]" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Milestone collection</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.35rem]">
            Stamps earned along the way.
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-7 text-asphalt/62 lg:text-right">
          The badge row now reads like keepsakes from a travel journal instead of utility chips dropped into a profile page.
        </p>
      </div>

      <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge, index) => (
          <div
            key={badge.key}
            className="group rounded-[1.9rem] border border-black/8 bg-white/80 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] border border-asphalt/10 bg-night text-2xl shadow-[0_12px_24px_rgba(15,23,42,0.18)]">
                {badge.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-asphalt/38">
                    Stamp {String(index + 1).padStart(2, "0")}
                  </p>
                  <span className="rounded-full border border-asphalt/10 bg-asphalt/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/50">
                    Earned
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-black tracking-[-0.03em] text-asphalt">{badge.name}</h3>
                <p className="mt-3 text-sm leading-7 text-asphalt/62">{badge.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
