import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerStateStory from "@/components/community/TravelerStateStory";
import TravelerStateTips from "@/components/community/TravelerStateTips";
import { entryPhotoCount, resolveEntryHeroImageUrl } from "@/lib/community/entry-gallery";
import { getTravelerEntries, getTravelerEntry, getTravelerProfile } from "@/lib/community/data";

const getTravelerProfileCached = cache(async (username: string) => getTravelerProfile(username));
const getTravelerEntryCached = cache(async (username: string, stateSlug: string) => getTravelerEntry(username, stateSlug));

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE = "https://visitall50states.com";

export async function generateMetadata({ params }: { params: { username: string; state: string } }): Promise<Metadata> {
  const profile = await getTravelerProfileCached(params.username);
  const entry = await getTravelerEntryCached(params.username, params.state);

  if (!profile || !entry) {
    return { title: "State journal", robots: { index: false, follow: false } };
  }

  const title = `${entry.stateName} with ${profile.displayName} | Visit All 50 States`;
  const description = entry.summary.trim().slice(0, 160);
  const hero = resolveEntryHeroImageUrl(entry);
  const ogImage =
    hero.startsWith("http://") || hero.startsWith("https://")
      ? hero
      : `${SITE}${hero.startsWith("/") ? hero : `/${hero}`}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE}/travelers/${params.username}/${params.state}`,
      images: [{ url: ogImage, alt: `${entry.stateName} — ${profile.displayName}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function TravelerStatePage({ params }: { params: { username: string; state: string } }) {
  const profile = await getTravelerProfileCached(params.username);
  const entry = await getTravelerEntryCached(params.username, params.state);

  if (!profile || !entry) notFound();

  const otherEntries = (await getTravelerEntries(params.username)).filter((item) => item.stateCode !== entry.stateCode).slice(0, 2);
  const photoCount = entryPhotoCount(entry);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 lg:space-y-10 lg:py-14">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-asphalt/45">
            <a href="/travelers" className="hover:text-asphalt">Travelers</a>
            <span>/</span>
            <a href={`/travelers/${params.username}`} className="hover:text-asphalt">@{params.username}</a>
            <span>/</span>
            <span className="text-asphalt/70">{entry.stateName}</span>
          </nav>

          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-night text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25"
              style={{ backgroundImage: `url(${resolveEntryHeroImageUrl(entry)})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.97),rgba(15,23,42,0.82),rgba(251,191,36,0.14))]" />
            <div className="relative p-8 lg:p-10 xl:p-12">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-brand">
                  {entry.stateName}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
                  Traveler: @{params.username}
                </span>
                {profile.currentRouteLabel ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75">
                    {profile.currentRouteLabel}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{entry.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/74">{entry.summary}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <TopMetric label="Visited" value={entry.dateVisited} />
                <TopMetric label="Region" value={entry.cityRegion} />
                <TopMetric label="Rating" value={`${entry.rating}/5`} />
                <TopMetric label="Family-friendly" value={entry.familyFriendly ? "Yes" : "No"} />
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
            <div className="rounded-[2.1rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-asphalt/42">Traveler context</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">Why this stop fits the bigger route.</h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-asphalt/68">{profile.northStar ?? profile.journeySummary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {(profile.routeHighlights ?? []).map((stop) => (
                  <span key={stop} className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-sm font-semibold text-asphalt/75">
                    {stop}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2.1rem] border border-[#1e293b]/10 bg-[#f4efe5] p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-asphalt/42">Route status</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">Map-to-story handoff.</h2>
              <div className="mt-6 space-y-3 text-sm text-asphalt/70">
                <DetailRow label="State on profile map" value={entry.status === "lived" ? "Marked lived" : "Marked visited"} />
                <DetailRow label="Story depth" value={`${photoCount} photo${photoCount === 1 ? "" : "s"} + comments`} />
                <DetailRow label="Best use" value="Public traveler journal page" />
              </div>
            </div>
          </section>

          <TravelerStateStory entry={entry} />
          <TravelerStateTips entry={entry} />

          {entry.comments.length > 0 ? (
            <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8 xl:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Notes from the road</p>
                  <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-asphalt">What people added</h2>
                  <p className="mt-3 max-w-2xl text-asphalt/62">
                    Shout-outs and tips saved on this entry — same thread your friends see when you share the link.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-cloud px-4 py-2 text-sm font-semibold text-asphalt/70">
                  {entry.comments.length} note{entry.comments.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {entry.comments.map((comment, index) => (
                  <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-[#fbfaf7] p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-white">
                        {comment.author.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-asphalt">{comment.author}</p>
                        <p className="mt-3 leading-relaxed text-asphalt/70">{comment.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {otherEntries.length > 0 && (
            <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] lg:p-8 xl:p-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">More from @{params.username}</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">Keep following the route.</h2>
                </div>
                <a href={`/travelers/${params.username}`} className="text-sm font-semibold uppercase tracking-[0.18em] text-asphalt/68 hover:text-asphalt">
                  Back to map →
                </a>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {otherEntries.map((item) => (
                  <a
                    key={item.stateCode}
                    href={`/travelers/${params.username}/${item.stateName.toLowerCase().replace(/\s+/g, "-")}`}
                    className="rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{item.stateName}</p>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-asphalt">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-asphalt/66">{item.summary}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-asphalt/10 bg-white/72 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</span>
      <span className="text-right font-semibold text-asphalt/86">{value}</span>
    </div>
  );
}
