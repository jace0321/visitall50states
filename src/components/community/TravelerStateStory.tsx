import type { TravelerStateEntry } from "@/lib/community/types";

export default function TravelerStateStory({ entry }: { entry: TravelerStateEntry }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Journey story</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-asphalt">{entry.title}</h2>
      <p className="mt-4 leading-relaxed text-asphalt/70">{entry.story}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-cloud p-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/45">Favorite memory</p>
          <p className="mt-2 text-asphalt/70">{entry.favoriteMemory}</p>
        </div>
        <div className="rounded-2xl bg-cloud p-4">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/45">Summary</p>
          <p className="mt-2 text-asphalt/70">{entry.summary}</p>
        </div>
      </div>
    </section>
  );
}
