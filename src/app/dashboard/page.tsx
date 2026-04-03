import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerHero from "@/components/community/TravelerHero";
import TravelerMap from "@/components/community/TravelerMap";
import TravelerStats from "@/components/community/TravelerStats";
import { demoMapStates, demoProfile } from "@/lib/community/mock-data";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-12">
          <TravelerHero profile={demoProfile} />
          <TravelerStats profile={demoProfile} />
          <TravelerMap username={demoProfile.username} states={demoMapStates} />
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Dashboard controls</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <a href="/dashboard/edit" className="rounded-2xl bg-cloud p-5 font-bold text-asphalt">Edit profile</a>
              <a href="/dashboard/map" className="rounded-2xl bg-cloud p-5 font-bold text-asphalt">Manage map</a>
              <a href="/dashboard/state/TN" className="rounded-2xl bg-cloud p-5 font-bold text-asphalt">Edit sample state entry</a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
