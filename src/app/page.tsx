import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import StatBar from "@/components/StatBar";
import EmailSignup from "@/components/EmailSignup";
import VisitedStatesExperience from "@/components/VisitedStatesExperience";

const HERO_PILLARS = [
  "Track every state you've hit",
  "Build a photo map in minutes",
  "Download something worth keeping",
];

const ROAD_VALUES = [
  {
    title: "Your map, your way",
    body: "Start with the states you've already earned. Watch the mission take shape the moment you begin.",
  },
  {
    title: "More feeling, less filler",
    body: "Upload your own photos, drop them into the map, and turn a road trip into something you can actually show off.",
  },
  {
    title: "Built to last on a wall",
    body: "Everything is designed to feel personal and print-worthy — from the first click to the final download.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <section className="site-shell-glow relative isolate min-h-screen overflow-hidden bg-night text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url('/hero-highway.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/55 to-night" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-14 pt-32">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-4xl">
              <p className="road-shimmer mb-5 inline-flex rounded-full border border-white/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 shadow-lg shadow-black/10 backdrop-blur-sm">
                Built from the road up
              </p>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                The journey of a lifetime, one state at a time.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/78 sm:text-xl">
                Track where you&apos;ve been, drop in your photos, and build a map that tells your story — not someone else&apos;s.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {HERO_PILLARS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/map-maker"
                  className="rounded-full bg-amber-brand px-8 py-4 text-lg font-bold text-night shadow-[0_18px_45px_rgba(245,158,11,0.32)] transition-all hover:-translate-y-1 hover:scale-[1.02] hover:bg-amber-deep"
                >
                  Make Your Map
                </Link>
                <Link
                  href="/about"
                  className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/16"
                >
                  Why this exists
                </Link>
              </div>
            </div>

            <div className="float-slow rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                Your 50-state mission
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                Your map. Your photos. Your story.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/72">
                Visit All 50 is about more than filling in a map. It&apos;s about saving proof that you were there — the coastlines, diners, detours, and state-line moments that make the miles mean something.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { value: "50", label: "States in the mission" },
                  { value: "1", label: "Photo map maker" },
                  { value: "∞", label: "Miles worth keeping" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <p className="text-3xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {ROAD_VALUES.map((item) => (
              <div
                key={item.title}
                className="pop-card rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-sm"
              >
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-brand">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="h-6 w-6 text-white/45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <StatBar />
      <Marquee />

      <section className="bg-cloud px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-deep mb-4">
            Why 50 states hits different
          </p>
          <h2 className="text-4xl font-black tracking-tight text-asphalt sm:text-5xl mb-8">
            Because the map becomes part of your story.
          </h2>
          <div className="space-y-6 text-left text-lg leading-relaxed text-asphalt/72 sm:text-center">
            <p>
              There&apos;s something different about pulling onto a two-lane highway in the middle of Kansas at golden hour. Or standing on a rocky Maine coast at sunrise, watching lobster boats head out. Or that moment you cross a state line and it actually feels like something.
            </p>
            <p>
              This isn&apos;t about checking boxes. It&apos;s about the stories, the roadside diners, the impulse detours, and the feeling of watching the country change around you one state at a time.
            </p>
            <p className="text-xl font-semibold text-amber-deep">
              Your miles deserve more than a camera roll. This is where they live.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-night px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-brand mb-4">
              How it works
            </p>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              From first state to finished map in minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Mark the states you've hit",
                desc: "Start with where you've already been and watch your progress come to life on the map.",
              },
              {
                step: "02",
                title: "Drop in your photos",
                desc: "Pair each state with a photo from the trip — the one that actually captures what it felt like to be there.",
              },
              {
                step: "03",
                title: "Download something worth keeping",
                desc: "Walk away with a personal, print-worthy map you can post, frame, or put on the wall.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="pop-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl"
              >
                <div className="mb-4 text-6xl font-black text-amber-brand">{item.step}</div>
                <h3 className="mb-3 text-2xl font-bold">{item.title}</h3>
                <p className="leading-relaxed text-white/62">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VisitedStatesExperience />

      <section className="bg-cloud px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-deep mb-4">
              From the road
            </p>
            <h2 className="text-4xl font-black tracking-tight text-asphalt sm:text-5xl">
              Why people keep coming back to the map.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "We printed our map and hung it in the living room. The kids point to it every day and talk about where we&apos;re going next.",
                name: "The Martinez Family",
                from: "32 states and counting",
              },
              {
                quote:
                  "I never thought I&apos;d care about visiting North Dakota. Then I drove through Theodore Roosevelt National Park and it became one of my favorite memories.",
                name: "Jake R.",
                from: "Solo road tripper, 47 states",
              },
              {
                quote:
                  "This site turned our road trips from vacations into a mission. Now everyone&apos;s asking what state is next. Best problem ever.",
                name: "Sarah & Tom",
                from: "28 states and still going",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="pop-card rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 text-4xl text-amber-brand">&ldquo;</div>
                <p className="mb-6 leading-relaxed text-asphalt/70">{t.quote}</p>
                <div>
                  <p className="font-bold text-asphalt">{t.name}</p>
                  <p className="text-sm text-asphalt/50">{t.from}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <EmailSignup />
      <Footer />
    </>
  );
}
