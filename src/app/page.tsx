import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import StatBar from "@/components/StatBar";
import EmailSignup from "@/components/EmailSignup";
import VisitedStatesExperience from "@/components/VisitedStatesExperience";
import HomeMapPreview from "@/components/HomeMapPreview";

const WHAT_YOU_CAN_DO = [
  {
    title: "Make a photo map",
    body: "Drop your trip photos onto a U.S. map in the browser. No account needed to try it — download a PNG when you like how it looks.",
    href: "/map-maker",
    linkLabel: "Open map maker",
  },
  {
    title: "Your map becomes your page",
    body: "With a free account, the same map lives on a shareable traveler page. Tap a state to open that trip’s photos, videos, and written memories — not just a colored shape.",
    href: "/login?next=/map-maker",
    linkLabel: "Sign in to save",
  },
  {
    title: "Explore states & travelers",
    body: "Read quick guides for all 50 states and see how other people are chasing the same mission.",
    href: "/states",
    linkLabel: "Browse states",
    secondaryHref: "/travelers",
    secondaryLabel: "Travelers",
  },
] as const;

const SITE_URL = "https://visitall50states.com";

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Visit All 50 States",
      description:
        "Free interactive U.S. photo map maker and traveler pages. Click any state on your map to open photos, videos, and travel stories from that stop.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Visit All 50 States",
      url: SITE_URL,
      description: "Tools and community for road trippers tracking all 50 U.S. states.",
    },
    {
      "@type": "WebApplication",
      name: "Visit All 50 States photo map maker",
      url: `${SITE_URL}/map-maker`,
      applicationCategory: "TravelApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Build a printable and shareable photo map of the United States. Mark visited states and place trip photos on the map.",
    },
  ],
};

const ROAD_VALUES = [
  {
    title: "Start with what you’ve already lived",
    body: "You don’t need a perfect grid. Add the states you’ve hit and the photos that still make you smile.",
  },
  {
    title: "Built to show off, not to scroll past",
    body: "The map is meant for the wall, the group chat, or the dinner-table story — not another forgotten album on your phone.",
  },
  {
    title: "Room for the long story later",
    body: "When you’re ready, add words per state on your traveler page so the map isn’t the only place the memory lives.",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />
      <Header />

      <section className="site-shell-glow relative isolate min-h-screen overflow-hidden bg-night text-white">
        <div
          className="home-hero-bg-motion absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{ backgroundImage: "url('/hero-highway.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/85 via-night/55 to-night" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 sm:pt-28 lg:pt-32">
          <div className="home-hero-reveal home-hero-reveal-delay-1 mx-auto mb-10 max-w-xl lg:mb-12 lg:max-w-none">
            <HomeMapPreview />
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
            <div>
              <p className="home-hero-reveal home-hero-reveal-delay-2 font-heading text-lg font-semibold italic text-amber-200/95 sm:text-xl">
                Visit All 50 States
              </p>
              <p className="home-hero-reveal home-hero-reveal-delay-3 mt-2 text-sm text-white/55">
                A home for road trippers, families, and anyone collecting America one state at a time.
              </p>

              <h1 className="home-hero-reveal home-hero-reveal-delay-4 mt-6 font-heading text-4xl font-extrabold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl md:text-6xl lg:text-[3.25rem] lg:leading-[1.08]">
                An interactive map of the U.S. where{" "}
                <span className="text-amber-100">every state can open into your photos, videos, and stories.</span>
              </h1>

              <p className="home-hero-reveal home-hero-reveal-delay-5 mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Not a travel agency — a{" "}
                <strong className="font-semibold text-white/90">free photo map maker</strong>,{" "}
                <strong className="font-semibold text-white/90">shareable traveler pages</strong>, and{" "}
                <strong className="font-semibold text-white/90">state-by-state journals</strong>. Build the map, save your
                link, then click any state you&apos;ve filled in to relive that leg of the trip.
              </p>

              <div className="home-hero-reveal home-hero-reveal-delay-6 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/map-maker"
                  className="inline-flex justify-center rounded-full bg-amber-brand px-7 py-3.5 text-base font-bold text-night shadow-[0_14px_40px_rgba(245,158,11,0.28)] transition duration-300 hover:scale-[1.03] hover:bg-amber-deep hover:shadow-[0_20px_50px_rgba(245,158,11,0.4)] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
                >
                  Make your photo map
                </Link>
                <Link
                  href="/about"
                  className="inline-flex justify-center rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  Why we built this
                </Link>
                <Link
                  href="/travelers"
                  className="inline-flex justify-center text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
                >
                  See traveler pages →
                </Link>
              </div>
            </div>

            <aside className="home-hero-reveal home-hero-reveal-delay-7 rounded-[1.75rem] border border-amber-400/20 bg-[#0c0f14]/80 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">What you can do here</p>
              <ul className="mt-5 space-y-6">
                {WHAT_YOU_CAN_DO.map((item) => (
                  <li key={item.title} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{item.body}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <Link href={item.href} className="text-sm font-semibold text-amber-brand hover:text-amber-200">
                        {item.linkLabel} →
                      </Link>
                      {"secondaryHref" in item && item.secondaryHref ? (
                        <Link href={item.secondaryHref} className="text-sm font-semibold text-white/55 hover:text-white/80">
                          {item.secondaryLabel} →
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="home-hero-reveal home-hero-reveal-delay-8 mt-14 rounded-[1.5rem] border border-white/10 bg-black/25 px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-center font-heading text-lg font-medium italic leading-relaxed text-white/85 sm:text-xl">
              &ldquo;The goal isn&apos;t just to visit all 50. It&apos;s to remember what each one meant.&rdquo;
            </p>
            <p className="mt-3 text-center text-xs text-white/45">From our story — we started as one family on the road.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROAD_VALUES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
              >
                <p className="text-base font-bold leading-snug text-amber-100">{item.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/68">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatBar />
      <Marquee />

      <section className="bg-cloud px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-deep mb-4">
            Why 50 states hits different
          </p>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-asphalt sm:text-5xl mb-8">
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
            <h2 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
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
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-asphalt sm:text-5xl">
              Why people keep coming back to the map.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "We printed our map and hung it in the living room. The kids point to it every day and talk about where we're going next.",
                name: "The Martinez Family",
                from: "32 states and counting",
              },
              {
                quote:
                  "I never thought I'd care about visiting North Dakota. Then I drove through Theodore Roosevelt National Park and it became one of my favorite memories.",
                name: "Jake R.",
                from: "Solo road tripper, 47 states",
              },
              {
                quote:
                  "This site turned our road trips from vacations into a mission. Now everyone's asking what state is next. Best problem ever.",
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
