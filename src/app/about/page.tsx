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
    title: "A tool for families",
    body: "Something other people could use too — not just to track states, but to actually see their journey take shape.",
  },
  {
    title: "A bigger mission",
    body: "A place for road trippers, parents, and memory-makers who know the miles matter because of who you share them with.",
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
    "Visit All 50 States started as a way for one dad to track where he and his boys had been together — and hold onto the memories that mattered most.",
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
              This started as a way to remember the miles that mattered.
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/68">
              Not a startup idea. Not a brand strategy. Just a simple way to track where my boys and I had been together — and hold onto the memories I didn&apos;t want to lose.
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
                It started small.
              </h2>
              <p>
                Travel With Earps started as a simple way to track where my kids and I had been together — and to hold onto the memories that mattered most.
              </p>
              <p>
                Road trips have a way of sneaking up on you like that. At first it&apos;s just a drive, a state sign, a few photos, another memory on the phone. Then one day you realize those moments have become part of your family story.
              </p>
              <p>
                A regular map wasn&apos;t enough. I didn&apos;t just want to mark a state off and move on. I wanted something that let us relive the trip — the pictures, the places, the feeling of being there together.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
              <p className="mb-3 text-xs uppercase tracking-[0.22em] text-asphalt/40">
                The core idea
              </p>
              <blockquote className="text-2xl font-black leading-tight tracking-tight text-asphalt">
                I wanted a map that didn&apos;t just show states we&apos;d visited, but let us relive each place through our own photos.
              </blockquote>
              <p className="mt-5 leading-relaxed text-asphalt/65">
                I couldn&apos;t find anything that did that the way I imagined, so I built it.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl md:p-10">
            <div className="max-w-3xl mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">
                What Visit All 50 States became
              </p>
              <h2 className="text-3xl font-black tracking-tight text-asphalt">
                A cleaner home for the memories behind the miles.
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

          <section className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-night p-8 text-white shadow-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-brand">
                What this site is for
              </p>
              <h2 className="text-3xl font-black tracking-tight">
                More than a checklist. More like a keepsake.
              </h2>
              <p className="mt-5 leading-relaxed text-white/70">
                Visit All 50 States is for people who want more than a list of states visited. It&apos;s for families building a story together, road trippers chasing the next line on the map, and anyone who knows a place matters more when it becomes part of your life.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    title: "Track progress",
                    body: "See the mission take shape instead of letting the dream stay abstract.",
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
              The goal isn&apos;t to make travel feel like homework. It&apos;s to give the good stuff a place to live — the state-line photos, the worn-out backseat naps, the weird roadside stops, the unexpected favorite places.
            </p>
            <p>
              If this site does its job well, it makes your progress feel real and your memories feel worth keeping. That&apos;s the whole point.
            </p>
            <p className="text-xl font-semibold text-amber-deep">
              The goal isn&apos;t just to visit all 50. It&apos;s to remember what each one meant.
            </p>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
            <p className="text-sm text-asphalt/50 mb-6">Ready to start your own version of the story?</p>
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
