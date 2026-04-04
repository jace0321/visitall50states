import type { TravelerStateEntry } from "@/lib/community/types";

export default function TravelerStateTips({ entry }: { entry: TravelerStateEntry }) {
  const items = [
    ["Best stop", entry.bestStop || "Still being added."],
    ["Hidden gem", entry.hiddenGem || "Still being added."],
    ["Best food", entry.bestFood || "Still being added."],
    ["Worth the detour?", entry.worthDetour ? "Absolutely. This is the kind of stop that earns its extra miles." : "Probably not unless it fits your route."],
    ["Family-friendly?", entry.familyFriendly ? "Yes — easier to enjoy with kids in the mix." : "Better for adults or a quick pass-through."],
  ];

  return (
    <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8 xl:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Useful notes</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-asphalt">What I&apos;d tell the next traveler</h2>
          <p className="mt-3 max-w-2xl text-asphalt/62">
            Practical details now come after the story and photo section, so the page reads like a journal first and a guide second.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-sm font-semibold text-asphalt/70">
          {entry.rating}/5 overall stop
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(([label, value], index) => (
            <div key={label} className="rounded-[1.6rem] border border-slate-200 bg-cloud p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/45">{label}</p>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-asphalt/55 ring-1 ring-slate-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 leading-relaxed text-asphalt/72">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#fff,rgba(245,247,250,0.92))] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/45">At a glance</p>
          <div className="mt-5 space-y-3 text-sm text-asphalt/70">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Region</span>
              <span className="font-semibold text-asphalt">{entry.cityRegion}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>Visited</span>
              <span className="font-semibold text-asphalt">{entry.dateVisited}</span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
              <span>State</span>
              <span className="font-semibold text-asphalt">{entry.stateName}</span>
            </div>
            <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-800">Bottom line</p>
              <p className="mt-2 leading-relaxed text-asphalt/75">
                {entry.summary} If you&apos;re already headed this way, this is a strong candidate for turning a pass-through into an actual memory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
