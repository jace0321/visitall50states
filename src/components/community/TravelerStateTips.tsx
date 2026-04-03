import type { TravelerStateEntry } from "@/lib/community/types";

export default function TravelerStateTips({ entry }: { entry: TravelerStateEntry }) {
  const items = [
    ["Best stop", entry.bestStop],
    ["Hidden gem", entry.hiddenGem],
    ["Best food", entry.bestFood],
    ["Worth detour", entry.worthDetour ? "Absolutely" : "Maybe not"],
    ["Family friendly", entry.familyFriendly ? "Yes" : "No"],
    ["Rating", `${entry.rating}/5`],
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Helpful notes</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-asphalt">What I&apos;d tell the next traveler</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-cloud p-4">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/45">{label}</p>
            <p className="mt-2 text-asphalt/70">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
