import type { TravelerProfile } from "@/lib/community/types";

export default function TravelerHero({ profile }: { profile: TravelerProfile }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-night p-8 text-white shadow-xl">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-brand">Traveler profile</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{profile.displayName}</h1>
          <p className="mt-2 text-white/60">@{profile.username}</p>
          <p className="mt-5 text-lg leading-relaxed text-white/75">{profile.journeySummary}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/75">
            <span className="rounded-full border border-white/15 px-3 py-1">Home base: {profile.homeState}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Style: {profile.travelStyle}</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Traveling with: {profile.travelingWith}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-right">
          <p className="text-sm text-white/55">Completion</p>
          <p className="text-4xl font-black text-amber-brand">{profile.completionPercent}%</p>
          <div className="mt-3 h-3 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-brand to-sky-brand" style={{ width: `${profile.completionPercent}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
