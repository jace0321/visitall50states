"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerHero from "@/components/community/TravelerHero";
import TravelerMap from "@/components/community/TravelerMap";
import TravelerStats from "@/components/community/TravelerStats";
import US_STATE_PATHS from "@/lib/us-map-paths";
import DashboardStateIndex from "./DashboardStateIndex";
import { useDashboardBundle } from "./useDashboardBundle";

export default function DashboardOverview() {
  const bundle = useDashboardBundle();

  if (bundle.status === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f7f4ee_46%,#f8fafc_100%)] pt-20 text-asphalt">
          <div className="mx-auto max-w-7xl space-y-8 px-6 py-16 lg:px-8">
            <div className="h-64 animate-pulse rounded-[2.75rem] bg-slate-200/80" />
            <div className="h-96 animate-pulse rounded-[2.5rem] bg-slate-200/60" />
            <p className="text-center text-sm font-semibold text-asphalt/45">Loading your dashboard…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (bundle.status === "unauthenticated") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cloud pt-20 text-asphalt">
          <div className="mx-auto max-w-lg px-6 py-20 text-center">
            <h1 className="font-heading text-3xl font-extrabold text-asphalt">Sign in to open your dashboard</h1>
            <p className="mt-4 text-asphalt/65">Your map, journal entries, and profile load here after you sign in.</p>
            <Link
              href="/login?next=/dashboard"
              className="mt-8 inline-flex rounded-full bg-amber-brand px-8 py-3.5 text-sm font-bold text-night hover:bg-amber-deep"
            >
              Sign in
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (bundle.status === "missing_env" || bundle.status === "error") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cloud pt-20 text-asphalt">
          <div className="mx-auto max-w-lg px-6 py-20 text-center">
            <h1 className="font-heading text-2xl font-extrabold text-asphalt">Dashboard unavailable</h1>
            <p className="mt-4 text-asphalt/65">
              {bundle.status === "missing_env"
                ? "Supabase environment variables are not configured."
                : bundle.message}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (bundle.status === "no_profile") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f7f4ee_46%,#f8fafc_100%)] pt-20 text-asphalt">
          <div className="mx-auto max-w-lg px-6 py-20 text-center">
            <h1 className="font-heading text-3xl font-extrabold text-asphalt">Create your traveler profile</h1>
            <p className="mt-4 text-asphalt/65">
              Set your display name and username once — then your map and state journals will show up here.
            </p>
            <Link
              href="/dashboard/edit"
              className="mt-8 inline-flex rounded-full bg-amber-brand px-8 py-3.5 text-sm font-bold text-night hover:bg-amber-deep"
            >
              Set up profile
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { profile, mapStates } = bundle;
  const featuredCode =
    US_STATE_PATHS.find((s) => s.name === profile.featuredState)?.code ??
    mapStates.find((s) => s.hasStory)?.code ??
    "IL";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f7f4ee_46%,#f8fafc_100%)] pt-20 text-asphalt">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-12 lg:px-8 lg:py-14">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
            <TravelerHero profile={profile} />
            <div className="rounded-[2.5rem] border border-[#1e293b]/10 bg-[#f4efe5] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Your studio</p>
              <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-asphalt sm:text-[2.4rem]">
                Edit what the world sees on your traveler page.
              </h1>
              <p className="mt-4 text-sm leading-7 text-asphalt/66">
                This preview uses your saved profile and map. When your profile is public, visitors see the same map and can open
                each state for photos and stories.
              </p>

              <div className="mt-6 space-y-3">
                <StudioRow label="Public page" value={profile.username ? `/travelers/${profile.username}` : "Set username in profile"} />
                <StudioRow label="Map status" value={`${profile.statesVisited}/50 states on your map`} />
                <StudioRow label="Featured state" value={profile.featuredState ?? "Not set"} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/dashboard/edit"
                  className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-center text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Edit profile
                </Link>
                <Link
                  href="/dashboard/map"
                  className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-center text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Full-width map
                </Link>
                <Link
                  href={`/dashboard/state/${featuredCode}`}
                  className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-center text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2"
                >
                  Open state editor ({featuredCode})
                </Link>
              </div>
            </div>
          </section>

          <TravelerMap
            username={profile.username}
            states={mapStates}
            featuredState={profile.featuredState}
            mapMakerHref="/map-maker"
          />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
            <TravelerStats profile={profile} />

            <div className="rounded-[2.4rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Quick links</p>
              <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-[-0.04em] text-asphalt">Keep building the archive</h2>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-asphalt/70">
                <li>
                  • <Link href="/map-maker" className="font-semibold text-amber-900 hover:underline">Map maker</Link> — update visited
                  states and sync to this map
                </li>
                <li>
                  • <Link href="/dashboard/photos" className="font-semibold text-amber-900 hover:underline">Photos</Link> — manage media
                  for your journals
                </li>
                <li>
                  • <Link href={`/travelers/${profile.username}`} className="font-semibold text-amber-900 hover:underline">
                    View public page
                  </Link>{" "}
                  (when your profile is public)
                </li>
                <li>
                  • <Link href="/dashboard/settings" className="font-semibold text-amber-900 hover:underline">
                    Settings
                  </Link>{" "}
                  — how public pages, map sync, and media work
                </li>
              </ul>
            </div>
          </section>

          <DashboardStateIndex />
        </div>
      </main>
      <Footer />
    </>
  );
}

function StudioRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-asphalt/10 bg-white/72 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</span>
      <span className="max-w-[55%] text-right text-sm font-semibold text-asphalt/84">{value}</span>
    </div>
  );
}
