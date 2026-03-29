import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllStates, getStateBySlug, getStateSlug } from "@/lib/states";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllStates().map((state) => ({
    slug: getStateSlug(state),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const state = getStateBySlug(params.slug);
  if (!state) return {};

  return {
    title: `${state.name} — ${state.nickname} | Travel Guide`,
    description: `Explore ${state.name}: must-see spots, hidden gems, ${state.nationalParks.length} national parks, and insider tips. Plan your ${state.name} road trip today.`,
  };
}

export default function StatePage({ params }: PageProps) {
  const state = getStateBySlug(params.slug);
  if (!state) notFound();

  return (
    <>
      <Header />
      <main className="pt-20 bg-cloud min-h-screen">
        {/* Hero Banner */}
        <section className="bg-night text-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
              <Link href="/" className="hover:text-amber-brand transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/states" className="hover:text-amber-brand transition-colors">
                States
              </Link>
              <span>/</span>
              <span className="text-white/80">{state.name}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-amber-brand font-semibold tracking-wide uppercase text-sm mb-2">
                  {state.region} &middot; {state.code}
                </p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.9] mb-3">
                  {state.name}
                </h1>
                <p className="text-white/60 text-xl italic">
                  {state.nickname}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-sm">Capital</p>
                <p className="text-white font-bold text-lg">{state.capital}</p>
                <p className="text-white/40 text-sm mt-2">Best Time to Visit</p>
                <p className="text-white font-bold">{state.bestTimeToVisit}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          {/* Must-See Spots */}
          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">01</span> Must-See Spots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.mustSeeSpots.map((spot) => {
                const [title, desc] = spot.split(" — ");
                return (
                  <div
                    key={spot}
                    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                  >
                    <h3 className="font-bold text-asphalt text-lg mb-1">{title}</h3>
                    {desc && <p className="text-asphalt/60 text-sm">{desc}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Hidden Gems */}
          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">02</span> Hidden Gems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.hiddenGems.map((gem) => {
                const [title, desc] = gem.split(" — ");
                return (
                  <div
                    key={gem}
                    className="bg-amber-brand/5 rounded-xl p-6 border border-amber-brand/10"
                  >
                    <h3 className="font-bold text-asphalt text-lg mb-1">{title}</h3>
                    {desc && <p className="text-asphalt/60 text-sm">{desc}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* National Parks */}
          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">03</span> National Parks &amp; Sites
            </h2>
            <div className="flex flex-wrap gap-3">
              {state.nationalParks.map((park) => (
                <span
                  key={park}
                  className="bg-sky-brand/10 text-sky-deep px-4 py-2 rounded-full text-sm font-medium"
                >
                  {park}
                </span>
              ))}
            </div>
          </section>

          {/* Insider Tips */}
          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">04</span> Insider Tips
            </h2>
            <div className="space-y-4">
              {state.insiderTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-brand/10 rounded-full flex items-center justify-center">
                    <span className="text-amber-deep font-bold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-asphalt/70 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <Link
              href="/map-maker"
              className="inline-block px-8 py-4 bg-amber-brand hover:bg-amber-deep text-night font-bold rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              Add {state.name} to Your Map
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
