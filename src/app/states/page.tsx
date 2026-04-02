import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllStates, getStateSlug } from "@/lib/states";

export const metadata: Metadata = {
  title: "All 50 States Travel Guides — Road Trip Tips, Hidden Gems & Must-See Spots",
  description:
    "Explore all 50 US states with insider tips, must-see spots, hidden gems, and national parks. The ultimate road trip planning guide for families and adventure travelers.",
  alternates: { canonical: "https://visitall50states.com/states" },
  openGraph: {
    title: "All 50 States Travel Guides — Road Trip Tips, Hidden Gems & Must-See Spots",
    description:
      "Explore all 50 US states with insider tips, must-see spots, hidden gems, and national parks.",
    url: "https://visitall50states.com/states",
    type: "website",
  },
};

const REGION_COLORS: Record<string, string> = {
  West: "bg-sky-brand/10 text-sky-deep",
  South: "bg-amber-brand/10 text-amber-deep",
  Midwest: "bg-emerald-50 text-emerald-700",
  Northeast: "bg-purple-50 text-purple-700",
};

export default function StatesPage() {
  const states = getAllStates();

  return (
    <>
      <Header />
      <main className="pt-20 bg-cloud min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-asphalt mb-4">
              All 50 States
            </h1>
            <p className="text-asphalt/60 text-lg max-w-2xl mx-auto">
              Every state has a story. Find the hidden gems, insider tips, and
              must-see spots that make each one unforgettable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {states.map((state) => (
              <Link
                key={state.code}
                href={`/states/${getStateSlug(state)}`}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-amber-brand/30 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-asphalt group-hover:text-amber-deep transition-colors">
                    {state.name}
                  </h2>
                  <span className="text-asphalt/30 font-mono text-sm font-bold">
                    {state.code}
                  </span>
                </div>
                <p className="text-sm text-asphalt/50 italic mb-3">
                  {state.nickname}
                </p>
                <p className="text-sm text-asphalt/70 line-clamp-2 mb-4">
                  {state.mustSeeSpots[0]?.split(" — ")[0]}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      REGION_COLORS[state.region] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {state.region}
                  </span>
                  <span className="text-xs text-asphalt/40">
                    {state.nationalParks.length} parks
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
