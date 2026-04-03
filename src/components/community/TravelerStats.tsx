import type { TravelerProfile } from "@/lib/community/types";

const statItems = (profile: TravelerProfile) => [
  { label: "States visited", value: profile.statesVisited },
  { label: "States lived", value: profile.statesLived },
  { label: "Capitals", value: profile.capitalsVisited },
  { label: "Capitol buildings", value: profile.capitolBuildingsVisited },
  { label: "National parks", value: profile.nationalParksVisited },
];

export default function TravelerStats({ profile }: { profile: TravelerProfile }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {statItems(profile).map((item) => (
        <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.18em] text-asphalt/45">{item.label}</p>
          <p className="mt-3 text-4xl font-black text-asphalt">{item.value}</p>
        </div>
      ))}
    </section>
  );
}
