import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BadgeStrip from "@/components/community/BadgeStrip";
import TravelerHero from "@/components/community/TravelerHero";
import TravelerMap from "@/components/community/TravelerMap";
import TravelerStats from "@/components/community/TravelerStats";
import { resolveEntryHeroImageUrl } from "@/lib/community/entry-gallery";
import {
  getCommunityStoryPreviews,
  getTravelerEntries,
  getTravelerMapStates,
  getTravelerProfile,
} from "@/lib/community/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Traveler Profile",
  description: "Follow a traveler's journey across all 50 states.",
};

export default async function TravelerProfilePage({ params }: { params: { username: string } }) {
  const profile = await getTravelerProfile(params.username);
  if (!profile) notFound();

  const mapStates = await getTravelerMapStates(params.username);
  const entries = await getTravelerEntries(params.username);
  const featuredEntry = entries[0];
  const recentEntries = entries.slice(1);
  const communityRail = (await getCommunityStoryPreviews(params.username)).slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f6_0%,#f7f4ee_42%,#f8fafc_100%)] pt-20 text-asphalt">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(14,165,233,0.10),transparent_22%)]" />

          <div className="relative mx-auto max-w-[94rem] px-4 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10 lg:px-8 xl:px-10">
            <section className="mx-auto max-w-7xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-asphalt/38">Traveler atlas</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-4">
                <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-asphalt sm:text-4xl">
                  {profile.displayName}
                </h1>
                <span className="text-sm font-semibold text-asphalt/50">@{params.username}</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-asphalt/62">
                The map comes first — each outline can carry a photo from that state&apos;s journal. Amber rings open the full story.
              </p>
            </section>
          </div>

            <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-3 sm:px-5 lg:px-8 xl:px-12">
              <div className="mx-auto max-w-[106rem]">
                <TravelerMap
                  username={params.username}
                  states={mapStates}
                  featuredState={profile.featuredState}
                  mapMakerHref="/map-maker"
                />
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[90rem] space-y-8 px-4 sm:px-6 lg:mt-10 lg:space-y-10 lg:px-8 xl:px-10">
              <div className="mx-auto max-w-7xl">
                <TravelerHero profile={profile} />
              </div>

              <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-[2.3rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Route note</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">{profile.currentRouteLabel ?? "Open road"}</h2>
                  <p className="mt-4 text-sm leading-7 text-asphalt/66">{profile.northStar ?? profile.journeySummary}</p>
                  <div className="mt-6 space-y-3">
                    {(profile.routeHighlights ?? []).map((stop, index) => (
                      <div key={stop} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-slate-200 bg-[#fbfaf7] px-4 py-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/40">Leg {String(index + 1).padStart(2, "0")}</span>
                        <span className="font-semibold text-asphalt">{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.3rem] border border-[#1e293b]/10 bg-[#f4efe5] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Next markers</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">What still pulls the route forward.</h2>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {(profile.nextTargets ?? []).map((target) => (
                      <span key={target} className="rounded-full border border-asphalt/10 bg-white/75 px-4 py-2 text-sm font-semibold text-asphalt/80">
                        {target}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-asphalt/64">
                    Wishlist states aren&apos;t dead space. They act like forward-looking beats in the same map story.
                  </p>
                </div>
              </section>

              {featuredEntry ? (
                <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-stretch">
                  <a
                    href={`/travelers/${params.username}/${featuredEntry.stateName.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group relative overflow-hidden rounded-[2.6rem] border border-white/60 bg-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_95px_rgba(15,23,42,0.16)]"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%)]" />
                    <div className="grid h-full lg:grid-cols-[1.05fr_0.95fr]">
                      <div
                        className="relative min-h-[22rem] bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(180deg, rgba(8,15,31,0.08), rgba(8,15,31,0.72)), url(${resolveEntryHeroImageUrl(featuredEntry)})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.22),transparent_26%)]" />
                        <div className="flex h-full min-h-[22rem] items-end p-6 sm:p-8 lg:p-9">
                          <div>
                            <span className="inline-flex rounded-full border border-white/15 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-asphalt shadow-sm">
                              {featuredEntry.stateName}
                            </span>
                            <p className="mt-4 max-w-sm text-sm uppercase tracking-[0.22em] text-white/62">Featured journal entry</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-deep">Lead story</p>
                        <h2 className="mt-4 text-3xl font-black leading-[1.02] tracking-[-0.04em] text-asphalt sm:text-[2.35rem]">
                          {featuredEntry.title}
                        </h2>
                        <p className="mt-5 border-l border-amber-300/80 pl-4 text-base italic leading-8 text-asphalt/68">
                          &ldquo;{featuredEntry.favoriteMemory}&rdquo;
                        </p>
                        <p className="mt-5 text-base leading-8 text-asphalt/70">{featuredEntry.summary}</p>
                        <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-asphalt/72 transition group-hover:translate-x-1 group-hover:text-asphalt">
                          Read the full story <span aria-hidden="true">→</span>
                        </span>
                      </div>
                    </div>
                  </a>

                  <div className="rounded-[2.4rem] border border-white/60 bg-[#f4efe5] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Editorial framing</p>
                    <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-asphalt">A roadbook feel around the map.</h2>
                    <div className="mt-6 space-y-4">
                      <SurfaceNote label="Visual language" value="Dark atlas hero, museum-card map, warm paper editorial panels" />
                      <SurfaceNote label="Composition" value="Map stays central while route context and stories orbit it" />
                      <SurfaceNote label="Profile voice" value={profile.bio} />
                    </div>
                  </div>
                </section>
              ) : null}

              {recentEntries.length > 0 && (
                <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/60 bg-white/72 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Road archive</p>
                      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.35rem]">More from the road.</h2>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-asphalt/60 lg:text-right">
                      Secondary entries keep the page feeling curated instead of collapsing into identical utility cards after the hero section.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {recentEntries.map((entry, index) => (
                      <a
                        key={entry.stateCode}
                        href={`/travelers/${params.username}/${entry.stateName.toLowerCase().replace(/\s+/g, "-")}`}
                        className="group overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#fbfaf7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                      >
                        <div
                          className="relative min-h-[16rem] bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.06), rgba(15,23,42,0.62)), url(${resolveEntryHeroImageUrl(entry)})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_26%)] opacity-80" />
                          <div className="flex h-full min-h-[16rem] items-end justify-between gap-4 p-5 sm:p-6">
                            <span className="rounded-full border border-white/15 bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt">
                              {entry.stateName}
                            </span>
                            <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/74 backdrop-blur-sm">
                              {String(index + 2).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 sm:p-6">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-asphalt/42">
                            {entry.cityRegion} · {entry.dateVisited}
                          </p>
                          <h3 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em] text-asphalt">{entry.title}</h3>
                          <p className="mt-4 text-sm leading-7 text-asphalt/66">{entry.summary}</p>
                          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-asphalt/68 transition group-hover:translate-x-1 group-hover:text-asphalt">
                            Open entry <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <TravelerStats profile={profile} />
              <BadgeStrip badges={profile.badges} />

              {communityRail.length > 0 && (
                <section className="mx-auto max-w-7xl rounded-[2.4rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-8">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Community rail</p>
                      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.2rem]">Elsewhere on the map.</h2>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-asphalt/60 lg:text-right">A small shared layer keeps the traveler ecosystem connected without pulling focus off the main map and archive.</p>
                  </div>

                  <div className="mt-7 grid gap-4 lg:grid-cols-3">
                    {communityRail.map((story) => (
                      <a
                        key={`${story.username}-${story.stateSlug}`}
                        href={`/travelers/${story.username}/${story.stateSlug}`}
                        className="rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">@{story.username}</p>
                        <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-asphalt">{story.stateName}</h3>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-deep">{story.routeLabel}</p>
                        <p className="mt-4 text-sm leading-7 text-asphalt/66">{story.title}</p>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function SurfaceNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-asphalt/10 bg-white/72 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-asphalt/40">{label}</p>
      <p className="mt-2 text-sm leading-7 text-asphalt/68">{value}</p>
    </div>
  );
}
