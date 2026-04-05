"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 lg:px-8 lg:py-12">
          <section className="flex flex-col gap-4 rounded-[2rem] border border-[#1e293b]/10 bg-white/85 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:px-7 sm:py-6">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-asphalt/45">Dashboard</p>
              <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-[-0.04em] text-asphalt sm:text-3xl">
                {profile.displayName}{" "}
                <span className="font-semibold text-asphalt/50">@{profile.username}</span>
              </h1>
              <p className="mt-1 text-sm text-asphalt/60">
                {profile.statesVisited}/50 on your map
                {profile.featuredState ? ` · Featured ${profile.featuredState}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/edit"
                className="rounded-full border border-asphalt/12 bg-white px-4 py-2.5 text-sm font-bold text-asphalt shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Edit profile
              </Link>
              <Link
                href="/dashboard/settings"
                className="rounded-full border border-asphalt/12 bg-white px-4 py-2.5 text-sm font-bold text-asphalt shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Settings
              </Link>
              <Link
                href={`/travelers/${profile.username}`}
                className="rounded-full border border-amber-200/80 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-950 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Public page
              </Link>
              <Link
                href="/map-maker"
                className="rounded-full border border-asphalt/12 bg-[#f4efe5] px-4 py-2.5 text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Map maker
              </Link>
              <Link
                href={`/dashboard/state/${featuredCode}`}
                className="rounded-full border border-sky-200/90 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-950 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Editor · {featuredCode}
              </Link>
            </div>
          </section>

          <TravelerMap
            username={profile.username}
            states={mapStates}
            featuredState={profile.featuredState}
            mapMakerHref="/map-maker"
            mapContext="dashboard"
          />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
            <TravelerStats profile={profile} />

            <div className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Shortcuts</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/photos"
                  className="rounded-full border border-asphalt/10 bg-white px-3 py-2 text-sm font-semibold text-asphalt hover:bg-asphalt/[0.04]"
                >
                  Photos
                </Link>
                <Link
                  href="/dashboard/map"
                  className="rounded-full border border-asphalt/10 bg-white px-3 py-2 text-sm font-semibold text-asphalt hover:bg-asphalt/[0.04]"
                >
                  Full-width map
                </Link>
              </div>
            </div>
          </section>

          <DashboardStateIndex />
        </div>
      </main>
      <Footer />
    </>
  );
}
