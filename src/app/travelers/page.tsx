import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { demoProfile } from "@/lib/community/mock-data";

export const metadata: Metadata = {
  title: "Traveler Community",
  description: "Browse public 50-state traveler pages, maps, and state-by-state journey notes.",
};

export default function TravelersPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Community</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-asphalt sm:text-5xl">Public traveler dashboards</h1>
          <p className="mt-4 max-w-2xl text-lg text-asphalt/65">MVP scaffold for the community layer: personal maps, state pages, and searchable journey notes.</p>

          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.18em] text-asphalt/45">Demo traveler</p>
            <h2 className="mt-2 text-3xl font-black text-asphalt">{demoProfile.displayName}</h2>
            <p className="mt-3 text-asphalt/65">{demoProfile.journeySummary}</p>
            <Link href={`/travelers/${demoProfile.username}`} className="mt-6 inline-block rounded-full bg-amber-brand px-6 py-3 font-bold text-night hover:bg-amber-deep">
              Open demo dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
