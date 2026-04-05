import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCommunityStoryPreviews, getTravelerSpotlightCards } from "@/lib/community/data";

export const metadata: Metadata = {
  title: "Travelers",
  description:
    "Meet families and road trippers chasing all 50 states. Open a traveler page for their live U.S. map, then tap any state for photos, videos, and stories from the road.",
};

export default async function TravelersPage() {
  const travelerSpotlightCards = await getTravelerSpotlightCards();
  const communityStoryPreviews = await getCommunityStoryPreviews();
  const travelerCount = travelerSpotlightCards.length;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#faf7f0] pt-20 text-asphalt">
        <div className="border-b border-[#e8e0d4] bg-[linear-gradient(180deg,#fffefb_0%,#f5efe4_100%)]">
          <div className="mx-auto max-w-5xl px-6 py-14 text-center lg:px-8 lg:py-20">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.28em] text-amber-800/80">
              Chasing all 50 states
            </p>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1a1f2e] sm:text-5xl lg:text-[3.15rem]">
              Real maps. Real miles. Real memories.
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-asphalt/45">
              One road at a time · photos worth keeping
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-asphalt/72">
              Every traveler here has a public page built around a U.S. map — the same idea as{" "}
              <a
                href="https://travelwithearps.com"
                className="font-semibold text-amber-900 underline decoration-amber-300/80 underline-offset-4 hover:text-amber-950"
                target="_blank"
                rel="noreferrer"
              >
                Travel With The Earps
              </a>
              : relive each state through <strong className="font-semibold text-asphalt/88">your pictures and videos</strong>, not
              just a checklist.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/map-maker"
                className="inline-flex rounded-full bg-[#c2410c] px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_36px_rgba(194,65,12,0.28)] transition hover:bg-[#9a3412]"
              >
                Make your photo map
              </Link>
              <Link
                href="/states"
                className="inline-flex rounded-full border border-asphalt/15 bg-white/80 px-7 py-3.5 text-sm font-semibold text-asphalt/85 shadow-sm transition hover:border-asphalt/25"
              >
                Browse state guides
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <section>
            <div className="flex flex-col gap-4 text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Travelers</p>
              <h2 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-[#1a1f2e] sm:text-4xl">
                Who&apos;s on the map right now
              </h2>
              <p className="mx-auto max-w-2xl text-base leading-7 text-asphalt/65 lg:mx-0">
                Click a card to open their live map. States with a story glow on the map — click through to see photos, clips, and
                journal entries from that stop.
              </p>
            </div>

            {travelerCount === 0 ? (
              <div className="mt-10 rounded-[2rem] border border-dashed border-amber-200/90 bg-white/80 px-8 py-14 text-center shadow-sm">
                <p className="font-heading text-2xl font-bold text-asphalt">No public traveler pages yet</p>
                <p className="mx-auto mt-4 max-w-lg text-asphalt/65">
                  When someone turns their profile public, they&apos;ll show up here with a cover photo from their road. Until then,
                  you can still use the map maker and state guides.
                </p>
                <Link
                  href="/map-maker"
                  className="mt-8 inline-flex rounded-full bg-amber-brand px-7 py-3 text-sm font-bold text-night hover:bg-amber-deep"
                >
                  Start your map
                </Link>
              </div>
            ) : (
              <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {travelerSpotlightCards.map((traveler) => (
                  <Link
                    key={traveler.username}
                    href={`/travelers/${traveler.username}`}
                    className="group flex flex-col overflow-hidden rounded-[2rem] border border-[#e8e0d4] bg-white shadow-[0_20px_50px_rgba(26,31,46,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(26,31,46,0.12)]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#e8e4dc]">
                      {traveler.coverImageUrl ? (
                        <Image
                          src={traveler.coverImageUrl}
                          alt={`${traveler.displayName} — trip photo`}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[linear-gradient(145deg,#fef3c7,#fde68a,#bfdbfe)] p-6 text-center">
                          <span className="font-heading text-4xl font-extrabold text-asphalt/25">{traveler.statesVisited}</span>
                          <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-asphalt/40">states logged</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">@{traveler.username}</p>
                          <p className="font-heading text-2xl font-bold text-white drop-shadow-sm">{traveler.displayName}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-amber-950 shadow">
                          {traveler.completionPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/80">{traveler.routeLabel}</p>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-asphalt/70">{traveler.deck}</p>
                      <div className="mt-5 grid grid-cols-2 gap-2 text-left text-xs">
                        <CardStat label="Home base" value={traveler.homeState} />
                        <CardStat label="On the map" value={`${traveler.statesVisited}/50`} />
                        <CardStat label="Featured state" value={traveler.featuredState} />
                        <CardStat label="Latest story" value={traveler.featuredStoryTitle} />
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-900/90 transition group-hover:gap-3">
                        Open their map <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {communityStoryPreviews.length > 0 ? (
            <section className="mt-16 lg:mt-20">
              <div className="flex flex-col gap-4 text-center lg:text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">From the road</p>
                <h2 className="font-heading text-3xl font-extrabold tracking-[-0.03em] text-[#1a1f2e] sm:text-4xl">
                  Recent state stops
                </h2>
                <p className="mx-auto max-w-2xl text-base leading-7 text-asphalt/65 lg:mx-0">
                  Photo-led journals you can open in one click — same flow you&apos;ll use on your own page once your states are filled
                  in.
                </p>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {communityStoryPreviews.map((story) => (
                  <Link
                    key={`${story.username}-${story.stateSlug}`}
                    href={`/travelers/${story.username}/${story.stateSlug}`}
                    className="group overflow-hidden rounded-[2rem] border border-[#e8e0d4] bg-white shadow-[0_16px_44px_rgba(26,31,46,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(26,31,46,0.1)]"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#e8e4dc]">
                      <Image
                        src={story.photoUrl}
                        alt={`${story.stateName} — ${story.displayName}`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
                        <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-asphalt">
                          {story.stateName}
                        </span>
                        <span className="rounded-full bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                          {story.routeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-asphalt/45">
                        @{story.username} · {story.displayName}
                      </p>
                      <h3 className="mt-3 font-heading text-2xl font-bold leading-snug tracking-[-0.02em] text-[#1a1f2e]">
                        {story.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-asphalt/65">{story.summary}</p>
                      <span className="mt-5 inline-flex text-sm font-bold text-amber-900/90 transition group-hover:translate-x-1">
                        See photos &amp; story →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-16 rounded-[2.4rem] border border-[#e8e0d4] bg-[#f4efe5] p-8 shadow-inner lg:mt-20 lg:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-asphalt/45">How it works</p>
              <h2 className="mt-4 font-heading text-2xl font-extrabold text-[#1a1f2e] sm:text-3xl">Map on the page. Memories inside each state.</h2>
              <p className="mt-4 text-asphalt/68">
                Visited states fill in on the map; when you add a journal and upload photos or videos, that state opens into a full
                page for anyone you share your link with — just like the early Earps site, but with the richer tools we&apos;ve built
                here.
              </p>
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
              <LegendPill color="#34d399" label="Visited" />
              <LegendPill color="#38bdf8" label="Lived" />
              <LegendPill color="#fbbf24" label="Wishlist" />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#efe8dc] bg-[#faf7f0] px-3 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-asphalt/40">{label}</p>
      <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-asphalt">{value}</p>
    </div>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-sm font-semibold text-asphalt shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
