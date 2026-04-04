import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCommunityStoryPreviews, getTravelerSpotlightCards } from "@/lib/community/data";

export const metadata: Metadata = {
  title: "Traveler Community",
  description: "Browse public 50-state traveler pages, map-first profiles, and state-by-state road stories.",
};

export default async function TravelersPage() {
  const travelerSpotlightCards = await getTravelerSpotlightCards();
  const communityStoryPreviews = await getCommunityStoryPreviews();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f8f4eb_45%,#f8fafc_100%)] pt-20 text-asphalt">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <section className="relative overflow-hidden rounded-[2.8rem] border border-white/60 bg-[#07111f] px-6 py-8 text-white shadow-[0_34px_120px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_26%),radial-gradient(circle_at_78%_16%,rgba(125,211,252,0.16),transparent_22%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/48">Community atlas</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.94] tracking-[-0.05em] sm:text-5xl lg:text-[4.25rem]">
                  Public traveler pages built around the map, not buried under widgets.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                  This MVP turns the community layer into a roadbook: each traveler has a real SVG map, a profile that feels editorial instead of dashboard-y, and state pages that read like lived trips first and utility second.
                </p>
              </div>

              <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm sm:grid-cols-3 lg:grid-cols-1">
                <QuickStat label="Public profiles" value={String(travelerSpotlightCards.length).padStart(2, "0")} />
                <QuickStat label="Fresh stories" value={String(communityStoryPreviews.length).padStart(2, "0")} />
                <QuickStat label="Centerpiece" value="SVG map" />
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Traveler spotlights</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-[2.4rem]">Real routes, different rhythms.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-asphalt/60 lg:text-right">
                Everyone gets the same map-first structure, but the page tone changes with the traveler — family loops, mountain runs, trade-road miles, and state stories worth opening.
              </p>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {travelerSpotlightCards.map((traveler, index) => (
                <Link
                  key={traveler.username}
                  href={`/travelers/${traveler.username}`}
                  className="group overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.13)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-asphalt/42">
                        Traveler {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">{traveler.displayName}</h3>
                    </div>
                    <span className="rounded-full border border-amber-300/40 bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-900">
                      {traveler.completionPercent}%
                    </span>
                  </div>

                  <p className="mt-5 text-sm uppercase tracking-[0.22em] text-asphalt/45">{traveler.routeLabel}</p>
                  <p className="mt-4 text-base leading-8 text-asphalt/70">{traveler.deck}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <CardFact label="Home base" value={traveler.homeState} />
                    <CardFact label="States logged" value={`${traveler.statesVisited}/50`} />
                    <CardFact label="Featured stop" value={traveler.featuredState} />
                    <CardFact label="Story lead" value={traveler.featuredStoryTitle} />
                  </div>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-asphalt/72 transition group-hover:translate-x-1 group-hover:text-asphalt">
                    Open traveler atlas <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
            <div className="rounded-[2.4rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Fresh from the road</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.3rem]">Recent state stories.</h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-asphalt/58">A shared community rail that makes the profile network feel alive without breaking the map-first product story.</p>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {communityStoryPreviews.map((story) => (
                  <Link
                    key={`${story.username}-${story.stateSlug}`}
                    href={`/travelers/${story.username}/${story.stateSlug}`}
                    className="group overflow-hidden rounded-[1.9rem] border border-slate-200 bg-[#fbfaf7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                  >
                    <div
                      className="relative min-h-[14rem] bg-cover bg-center"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.62)), url(${story.photoUrl})` }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%)] opacity-80" />
                      <div className="flex min-h-[14rem] items-end justify-between gap-4 p-5">
                        <span className="rounded-full border border-white/15 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt">
                          {story.stateName}
                        </span>
                        <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/74 backdrop-blur-sm">
                          {story.routeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">@{story.username} · {story.displayName}</p>
                      <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em] text-asphalt">{story.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-asphalt/65">{story.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-[2.4rem] border border-[#1e293b]/10 bg-[#f6f0e3] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Map language</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">How the MVP reads.</h2>
              <div className="mt-6 space-y-4">
                <MapLegendRow color="#34d399" label="Visited" note="State logged with memories or notes." />
                <MapLegendRow color="#38bdf8" label="Lived" note="Places that count as longer chapters, not quick passes." />
                <MapLegendRow color="#fbbf24" label="Wishlist" note="Planned targets still pulling the route forward." />
                <MapLegendRow color="rgba(15,23,42,0.18)" label="Open space" note="Unmarked territory still waiting for a real trip." />
              </div>

              <div className="mt-8 rounded-[1.7rem] border border-asphalt/10 bg-white/70 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">Tonight&apos;s usable slice</p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-asphalt/68">
                  <li>• Public traveler directory with profile entry points</li>
                  <li>• Map-first traveler pages with editorial framing</li>
                  <li>• State journal pages with stories, practical notes, and conversation mock</li>
                  <li>• Shared visual language that avoids generic dashboard UI</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/15 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">{value}</p>
    </div>
  );
}

function CardFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white/85 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/40">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-asphalt">{value}</p>
    </div>
  );
}

function MapLegendRow({ color, label, note }: { color: string; label: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-asphalt/10 bg-white/72 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/70">{label}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-asphalt/64">{note}</p>
    </div>
  );
}
