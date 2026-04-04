import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerHero from "@/components/community/TravelerHero";
import TravelerMap from "@/components/community/TravelerMap";
import TravelerStats from "@/components/community/TravelerStats";
import { demoMapStates, demoProfile } from "@/lib/community/mock-data";
import DashboardStateIndex from "./DashboardStateIndex";

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f7f4ee_46%,#f8fafc_100%)] pt-20 text-asphalt">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-12 lg:px-8 lg:py-14">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
            <TravelerHero profile={demoProfile} />
            <div className="rounded-[2.5rem] border border-[#1e293b]/10 bg-[#f4efe5] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Creator studio</p>
              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt sm:text-[2.4rem]">Shape the public atlas before it goes live.</h1>
              <p className="mt-4 text-sm leading-7 text-asphalt/66">
                The private dashboard now mirrors the public traveler language: same map centerpiece, same story-first framing, but with clear editing and publishing control points around it.
              </p>

              <div className="mt-6 space-y-3">
                <StudioRow label="Profile mode" value="Public-facing traveler page" />
                <StudioRow label="Map status" value={`${demoProfile.statesVisited}/50 states logged`} />
                <StudioRow label="Featured state" value={demoProfile.featuredState ?? "Not set"} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href="/dashboard/edit" className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md">
                  Edit profile voice
                </a>
                <a href="/dashboard/map" className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md">
                  Manage map states
                </a>
                <a href="/dashboard/state/MT" className="rounded-[1.5rem] border border-asphalt/10 bg-white px-5 py-4 text-sm font-bold text-asphalt transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2">
                  Open real state editor
                </a>
              </div>
            </div>
          </section>

          <TravelerMap username={demoProfile.username} states={demoMapStates} featuredState={demoProfile.featuredState} />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
            <TravelerStats profile={demoProfile} />

            <div className="rounded-[2.4rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-asphalt/42">Publish checklist</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-asphalt">Tonight&apos;s MVP is almost there.</h2>
              <div className="mt-6 space-y-3">
                <ChecklistRow done label="Map uses real SVG paths with state status colors" />
                <ChecklistRow done label="Traveler profile and state pages share one visual language" />
                <ChecklistRow done label="Community directory has multiple public traveler entry points" />
                <ChecklistRow label="Replace mock comments with live backend thread model" />
                <ChecklistRow label="Swap demo media for real uploaded traveler photos" />
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

function StudioRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-asphalt/10 bg-white/72 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-asphalt/42">{label}</span>
      <span className="text-right text-sm font-semibold text-asphalt/84">{value}</span>
    </div>
  );
}

function ChecklistRow({ done, label }: { done?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-[#fbfaf7] px-4 py-3">
      <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-emerald-500 text-white" : "bg-asphalt/10 text-asphalt/55"}`}>
        {done ? "✓" : "•"}
      </span>
      <span className="text-sm leading-7 text-asphalt/70">{label}</span>
    </div>
  );
}
