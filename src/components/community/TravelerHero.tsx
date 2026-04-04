import type { TravelerProfile } from "@/lib/community/types";

export default function TravelerHero({ profile }: { profile: TravelerProfile }) {
  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#060b16] text-white shadow-[0_30px_120px_rgba(2,6,23,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.16),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,rgba(255,255,255,0.02))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute inset-y-0 right-[10%] hidden w-px bg-white/8 lg:block" />

      <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(17rem,0.72fr)] lg:px-10 lg:py-9 xl:px-12 xl:py-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/50">
            Collector&apos;s profile
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/58">
            <span className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 backdrop-blur-sm">
              @{profile.username}
            </span>
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100 backdrop-blur-sm">
              {profile.statesVisited}/50 logged
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem]">
            {profile.displayName}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-white/74 sm:text-[1.02rem] sm:leading-8 lg:text-[1.06rem] lg:leading-8">
            {profile.journeySummary}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Home base" value={profile.homeState} />
            <MetricCard label="Traveling with" value={profile.travelingWith} />
            <MetricCard label="Travel style" value={profile.travelStyle.replace(/-/g, " ")} />
            <MetricCard label="Current route" value={profile.currentRouteLabel ?? "Open road"} />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-md sm:p-5 lg:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/44">
              Journey completion
            </p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-black tracking-[-0.05em] text-white sm:text-7xl">
                {profile.completionPercent}
              </span>
              <span className="pb-2 text-lg font-semibold uppercase tracking-[0.24em] text-amber-200/88">
                %
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/62">
              {profile.northStar ?? "A growing archive of family miles, detours worth keeping, and the states that left a mark."}
            </p>
          </div>

          <div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#fbbf24_0%,#fde68a_45%,#7dd3fc_100%)] shadow-[0_0_28px_rgba(251,191,36,0.45)]"
                style={{ width: `${profile.completionPercent}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">
              <span>{profile.statesVisited} states visited</span>
              <span>{50 - profile.statesVisited} still ahead</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Fact label="Milestones" value={`${profile.badges.length} earned`} />
            <Fact label="Capitals" value={`${profile.capitalsVisited} seen`} />
            <Fact label="Parks" value={`${profile.nationalParksVisited} checked`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] px-4 py-4 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/42">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-white/92 sm:text-[0.95rem]">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</span>
      <span className="text-sm font-semibold text-white/90">{value}</span>
    </div>
  );
}
