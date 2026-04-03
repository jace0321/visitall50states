import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BadgeStrip from "@/components/community/BadgeStrip";
import TravelerHero from "@/components/community/TravelerHero";
import TravelerMap from "@/components/community/TravelerMap";
import TravelerStats from "@/components/community/TravelerStats";
import { demoMapStates, demoProfile, demoEntries } from "@/lib/community/mock-data";

export const metadata: Metadata = {
  title: "Traveler Dashboard",
  description: "Public traveler dashboard mock for the Visit All 50 States community layer.",
};

export default function TravelerProfilePage({ params }: { params: { username: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-12">
          <TravelerHero profile={{ ...demoProfile, username: params.username }} />
          <TravelerStats profile={demoProfile} />
          <TravelerMap username={params.username} states={demoMapStates} />
          <BadgeStrip badges={demoProfile.badges} />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Recent state entries</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {demoEntries.map((entry) => (
                <a
                  key={entry.stateCode}
                  href={`/travelers/${params.username}/${entry.stateName.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-3xl border border-slate-200 bg-cloud p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-asphalt/45">{entry.stateName}</p>
                  <h2 className="mt-2 text-2xl font-black text-asphalt">{entry.title}</h2>
                  <p className="mt-3 text-asphalt/65">{entry.summary}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
