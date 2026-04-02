import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WHAT_IT_BECAME = [
  {
    title: "A memory map",
    body: "A better way to keep the trips, the photos, and the stories from disappearing into a camera roll.",
  },
  {
    title: "A tool for road trippers",
    body: "Something anyone could use — not just to track states, but to actually see their journey take shape.",
  },
  {
    title: "A growing community",
    body: "A place for road trippers, families, and memory-makers who know the miles matter because of the people and moments behind them.",
  },
];

const VALUES = [
  "Built around memories, not metrics",
  "Designed to feel personal before it feels technical",
  "Made for people who want the miles to mean something",
];

export const metadata: Metadata = {
  title: "About — Why Visit All 50 States Exists",
  description:
    "Visit All 50 States started as a personal road trip project and grew into a tool for anyone chasing the 50-state mission. Here's how it happened.",
  alternates: { canonical: "https://visitall50states.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <section className="relative overflow-hidden bg-night px-6 py-20 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_28%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-brand">
              Why this exists
            </p>
            <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight sm:text-6xl">
              It started as a road trip project. It became something bigger.
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/68">
              One dad. Three boys. A mission to hit all 50 states — and a need for a better way to track it. That&apos;s where this started.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {VALUES.map((value) => (
                <span
                  key={value}
                  className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/78 backdrop-blur"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-16 space-y-14">
          <section className="grid items-start gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5 text-lg leading-relaxed text-asphalt/75">
              <h2 className="text-3xl font-black tracking-tight text-asphalt">
                How it started.
              </h2>
              <p>
                It started as a personal thing — a way to track the states we&apos;d hit and hold onto the memories that come with them. Road trips with the kids, long hauls across states we&apos;d never seen, trying to find something worth showing them in every corner of the country.
              </p>
              <p>
                A regular map wasn&apos;t enough. Marking a state off and moving on felt like leaving the story behind. What I wanted was something that let you tie the trip to your actual photos — to relive it, not just record it.
              </p>
              <p>
                I couldn&apos;t find that anywhere, so I built it.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-asphalt/40">
                The core idea
              </p>
              <blockquote className="text-2xl font-black leading-tight tracking-tight text-asphalt">
                A map that doesn&apos;t just show where you&apos;ve been — it shows what it looked like when you got there.
              </blockquote>
              <p className="mt-5 leading-relaxed text-asphalt/65">
                Your photos. Your states. Your story, in one place.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl md:p-10">
            <div className="max-w-3xl mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">
                What it became
              </p>
              <h2 className="text-3xl font-black tracking-tight text-asphalt">
                A tool for anyone chasing the 50-state mission.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {WHAT_IT_BECAME.map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-cloud p-6">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-deep">
                    {item.title}
                  </p>
                  <p className="leading-relaxed text-asphalt/70">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Community nod */}
          <section className="rounded-[2rem] border border-amber-brand/20 bg-amber-brand/5 p-8 md:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">
              Built with the community in mind
            </p>
            <h2 className="text-3xl font-black tracking-tight text-asphalt mb-5">
              The 50-state community already exists. This is built for them.
            </h2>
            <p className="text-lg leading-relaxed text-asphalt/70 max-w-3xl">
              There are tens of thousands of people already chasing the 50-state mission — in Facebook groups, Reddit threads, road trip forums, and family travel blogs. They&apos;re tracking progress on spreadsheets, pinning paper maps, and sharing photos across a dozen different apps. This site is built to give that community one place that actually fits what they&apos;re doing.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-night p-8 text-white shadow-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-brand">
                What this site is for
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                More than a checklist. More like a keepsake.
              </h2>
              <p className="mt-5 leading-relaxed text-white/70">
                Visit All 50 States is for road trippers, families, solo adventurers, and anyone who knows a place matters more when it becomes part of your life. It&apos;s for the people who want more than a list — they want something to look back on.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    title: "Track progress",
                    body: "See the mission take shape instead of letting the goal stay abstract.",
                  },
                  {
                    title: "Save the photos",
                    body: "Tie each state to the pictures and memories you actually care about.",
                  },
                  {
                    title: "Keep the story",
                    body: "Turn scattered moments into something you can revisit, share, and print.",
                  },
                ].map((item) => (
                  <div key={item.title}>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-asphalt/45">
                      {item.title}
                    </p>
                    <p className="mt-3 leading-relaxed text-asphalt/70">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-5 text-lg leading-relaxed text-asphalt/75">
            <h2 className="text-3xl font-black tracking-tight text-asphalt">
              What matters most
            </h2>
            <p>
              The goal isn&apos;t to make travel feel like homework. It&apos;s to give the good stuff a place to live — the state-line moments, the worn-out backseat naps, the weird roadside stops, the unexpected favorites.
            </p>
            <p>
              If this site does its job, it makes your progress feel real and your memories feel worth keeping.
            </p>
            <p className="text-xl font-semibold text-amber-deep">
              The goal isn&apos;t just to visit all 50. It&apos;s to remember what each one meant.
            </p>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <p className="text-sm text-asphalt/50 mb-6">Ready to build your map?</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/map-maker"
                className="rounded-full bg-amber-brand px-8 py-4 text-lg font-bold text-night shadow-lg transition-all hover:scale-[1.02] hover:bg-amber-deep"
              >
                Make Your Map
              </Link>
              <Link
                href="/states"
                className="rounded-full bg-asphalt px-8 py-4 text-lg font-bold text-white transition-all hover:bg-night"
              >
                Explore All States
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
