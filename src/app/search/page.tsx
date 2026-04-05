import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllStates } from "@/lib/states";
import ExploreStates from "./ExploreStates";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Browse all 50 U.S. state travel guides, find public traveler maps, and open the free photo map maker — quick links and a filterable state list.",
  openGraph: {
    title: "Explore | Visit All 50 States",
    description: "Filter all 50 states, read guides, and meet travelers on the map.",
  },
};

export default function SearchPage() {
  const states = getAllStates();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f5efe8_100%)] pt-20 text-asphalt">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-deep">Explore</p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-[#1a1f2e] sm:text-5xl">
            Find a state, a tool, or a traveler
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-asphalt/70">
            Site-wide search across journals is on the roadmap. For now, use the list below for official state guides, or jump
            straight to travelers and the map maker.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/travelers"
              className="inline-flex rounded-full bg-night px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-asphalt"
            >
              Traveler directory
            </Link>
            <Link
              href="/map-maker"
              className="inline-flex rounded-full border border-asphalt/15 bg-white px-6 py-3 text-sm font-bold text-asphalt shadow-sm transition hover:border-amber-300"
            >
              Photo map maker
            </Link>
            <Link
              href="/states"
              className="inline-flex rounded-full border border-asphalt/15 bg-white px-6 py-3 text-sm font-bold text-asphalt shadow-sm transition hover:border-amber-300"
            >
              All states (overview)
            </Link>
          </div>

          <div className="mt-14 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <h2 className="font-heading text-2xl font-bold text-asphalt">State guides</h2>
            <p className="mt-2 text-sm text-asphalt/60">Each link opens tips, parks, and ideas for that state.</p>
            <div className="mt-8">
              <ExploreStates states={states} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
