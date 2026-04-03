import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerStateStory from "@/components/community/TravelerStateStory";
import TravelerStateTips from "@/components/community/TravelerStateTips";
import { getDemoEntryByState } from "@/lib/community/mock-data";

export const metadata: Metadata = {
  title: "Traveler State Entry",
  description: "Personal state-by-state journey page mock for the Visit All 50 States community layer.",
};

export default function TravelerStatePage({ params }: { params: { username: string; state: string } }) {
  const entry = getDemoEntryByState(params.state);
  if (!entry) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
          <section className="rounded-[2rem] border border-white/10 bg-night p-8 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-brand">{entry.stateName} journey page</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{entry.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-white/70">{entry.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/70">
              <span className="rounded-full border border-white/15 px-3 py-1">Traveler: @{params.username}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Visited: {entry.dateVisited}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Region: {entry.cityRegion}</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Rating: {entry.rating}/5</span>
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <TravelerStateStory entry={entry} />
            <TravelerStateTips entry={entry} />
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Comments</p>
            <div className="mt-6 space-y-4">
              {entry.comments.map((comment, index) => (
                <div key={index} className="rounded-2xl bg-cloud p-4">
                  <p className="font-bold text-asphalt">{comment.author}</p>
                  <p className="mt-2 text-asphalt/70">{comment.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
