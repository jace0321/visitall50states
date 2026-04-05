"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerMap from "@/components/community/TravelerMap";
import { useDashboardBundle } from "./useDashboardBundle";

export default function DashboardMapPanel() {
  const bundle = useDashboardBundle();

  if (bundle.status === "loading") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cloud pt-20">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="h-[min(70vh,40rem)] animate-pulse rounded-[2.5rem] bg-slate-200/70" />
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
        <main className="min-h-screen bg-cloud pt-20">
          <div className="mx-auto max-w-md px-6 py-16 text-center">
            <p className="text-asphalt/70">Sign in to see your map.</p>
            <Link href="/login?next=/dashboard/map" className="mt-6 inline-block font-bold text-amber-900 hover:underline">
              Sign in →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (bundle.status === "no_profile" || bundle.status === "missing_env" || bundle.status === "error") {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-cloud pt-20">
          <div className="mx-auto max-w-md px-6 py-16 text-center text-asphalt/70">
            {bundle.status === "no_profile" ? (
              <>
                <p>Create your traveler profile first.</p>
                <Link href="/dashboard/edit" className="mt-6 inline-block font-bold text-amber-900 hover:underline">
                  Set up profile →
                </Link>
              </>
            ) : (
              <p>Map could not be loaded.</p>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { profile, mapStates } = bundle;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-asphalt/42">Your map</p>
              <h1 className="mt-2 font-heading text-2xl font-extrabold text-asphalt">@{profile.username}</h1>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-amber-900 hover:underline">
              ← Back to dashboard
            </Link>
          </div>
          <TravelerMap
            username={profile.username}
            states={mapStates}
            featuredState={profile.featuredState}
            mapMakerHref="/map-maker"
            mapContext="dashboard"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
