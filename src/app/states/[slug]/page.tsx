import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { stateHeroImages } from "@/data/stateHeroImages";
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

  const slug = getStateSlug(state);
  const url = `https://visitall50states.com/states/${slug}`;
  const title = `${state.name} Travel Guide — Best Places to Visit, Hidden Gems & Road Trip Tips`;
  const description = `Planning a trip to ${state.name}? Discover must-see spots, hidden gems, ${state.nationalParks.length} national parks, and insider road trip tips for ${state.name} (${state.nickname}).`;
  const heroImage = stateHeroImages[state.code];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: heroImage ? [{ url: heroImage.directImageUrl, alt: heroImage.alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: heroImage ? [heroImage.directImageUrl] : undefined,
    },
  };
}

export default function StatePage({ params }: PageProps) {
  const state = getStateBySlug(params.slug);
  if (!state) notFound();

  const allStates = getAllStates();
  const currentIndex = allStates.findIndex((s) => s.code === state.code);
  const prevState = currentIndex > 0 ? allStates[currentIndex - 1] : null;
  const nextState = currentIndex < allStates.length - 1 ? allStates[currentIndex + 1] : null;

  const slug = getStateSlug(state);
  const url = `https://visitall50states.com/states/${slug}`;
  const heroImage = stateHeroImages[state.code];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${state.name} Travel Guide`,
    description: `Must-see spots, hidden gems, national parks, and insider tips for visiting ${state.name}.`,
    url,
    touristType: ["Family", "Road tripper", "Adventure traveler"],
    image: heroImage?.directImageUrl,
    containsPlace: state.nationalParks.map((park) => ({
      "@type": "LandmarksOrHistoricalBuildings",
      name: park,
    })),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://visitall50states.com" },
        { "@type": "ListItem", position: 2, name: "States", item: "https://visitall50states.com/states" },
        { "@type": "ListItem", position: 3, name: state.name, item: url },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="pt-20 bg-cloud min-h-screen">
        <section className="bg-night text-white py-16 px-6">
          <div className="max-w-5xl mx-auto">
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
                <p className="text-white/60 text-xl italic">{state.nickname}</p>
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
          {heroImage && (
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={heroImage.directImageUrl}
                  alt={heroImage.alt}
                  className="h-full w-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">Featured view</p>
                  <p className="mt-1 text-lg font-bold">{heroImage.alt}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 px-5 py-4 text-sm text-asphalt/65 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Photo credit{" "}
                  <a
                    href={heroImage.creditUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-asphalt hover:text-amber-deep"
                  >
                    {heroImage.creditText}
                  </a>{" "}
                  via {heroImage.sourceName}
                </p>
                <a
                  href={heroImage.imagePageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-amber-deep hover:text-amber-brand"
                >
                  {heroImage.license}
                </a>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">01</span> Must-See Spots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.mustSeeSpots.map((spot) => {
                const [title, desc] = spot.split(" — ");
                return (
                  <div key={spot} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-asphalt text-lg mb-1">{title}</h3>
                    {desc && <p className="text-asphalt/60 text-sm">{desc}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">02</span> Hidden Gems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.hiddenGems.map((gem) => {
                const [title, desc] = gem.split(" — ");
                return (
                  <div key={gem} className="bg-amber-brand/5 rounded-xl p-6 border border-amber-brand/10">
                    <h3 className="font-bold text-asphalt text-lg mb-1">{title}</h3>
                    {desc && <p className="text-asphalt/60 text-sm">{desc}</p>}
                  </div>
                );
              })}
            </div>
          </section>

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

          <section>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-8 flex items-center gap-3">
              <span className="text-amber-brand">04</span> Insider Tips
            </h2>
            <div className="space-y-4">
              {state.insiderTips.map((tip, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-brand/10 rounded-full flex items-center justify-center">
                    <span className="text-amber-deep font-bold text-sm">{i + 1}</span>
                  </div>
                  <p className="text-asphalt/70 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center py-8">
            <Link
              href="/map-maker"
              className="inline-block px-8 py-4 bg-amber-brand hover:bg-amber-deep text-night font-bold rounded-full text-lg transition-all hover:scale-105 shadow-lg"
            >
              Add {state.name} to Your Map
            </Link>
          </section>

          {(prevState || nextState) && (
            <nav className="flex items-center justify-between gap-4 pt-8 border-t border-gray-200">
              {prevState ? (
                <Link
                  href={`/states/${getStateSlug(prevState)}`}
                  className="group flex items-center gap-3 text-asphalt/60 hover:text-asphalt transition-colors"
                >
                  <span className="text-2xl">←</span>
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-asphalt/40 group-hover:text-asphalt/60">
                      Previous
                    </span>
                    <span className="font-bold">{prevState.name}</span>
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextState ? (
                <Link
                  href={`/states/${getStateSlug(nextState)}`}
                  className="group flex items-center gap-3 text-right text-asphalt/60 hover:text-asphalt transition-colors"
                >
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-asphalt/40 group-hover:text-asphalt/60">
                      Next
                    </span>
                    <span className="font-bold">{nextState.name}</span>
                  </span>
                  <span className="text-2xl">→</span>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
