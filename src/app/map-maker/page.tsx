import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapMakerEmbed from "./MapMakerEmbed";

const QUICK_STEPS = [
  "Upload a favorite photo from the trip",
  "Drag and size it where it feels right",
  "Download a cleaner map you can keep or share",
];

const SHARE_JOURNEY_STEPS = [
  {
    title: "Sign in (free)",
    body: "Create an account or log in — then come back to this map maker while your collage is still in the browser.",
    href: "/login?next=/map-maker",
    cta: "Sign in",
  },
  {
    title: "Sync your map to your page",
    body: "Use the buttons under the map: sync visited states, then upload map photos to your journal so your live map matches what you built.",
    href: null,
    cta: null,
  },
  {
    title: "Add a line about each state",
    body: "In the dashboard, open any state and save a title, summary, or favorite memory — that’s what makes your public page feel like a keepsake, not a checklist.",
    href: "/dashboard",
    cta: "Open dashboard",
  },
  {
    title: "Share your link",
    body: "Your traveler page is one URL you can send to family or print later. It’s the same mission as this tool — just saved where it won’t disappear from your camera roll.",
    href: "/travelers",
    cta: "See example travelers",
  },
] as const;

export const metadata: Metadata = {
  title: "Free USA Photo Map Maker — Create Your 50 State Travel Map",
  description:
    "Create a free personalized 50 state photo map! Upload your travel photos, position them on the USA map, and download a beautiful keepsake of your American road trip adventures.",
  alternates: { canonical: "https://visitall50states.com/map-maker" },
  openGraph: {
    title: "Free USA Photo Map Maker — Create Your 50 State Travel Map",
    description:
      "Upload your travel photos and build a beautiful personalized USA map. Free, instant download. No account needed.",
    url: "https://visitall50states.com/map-maker",
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the 50 state photo map maker free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, it's completely free. Upload your photos, position them on the map, and download your finished map — no account or payment required.",
      },
    },
    {
      "@type": "Question",
      name: "What file format does the map download in?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your finished map downloads as a high-resolution PNG, ready to print or share on social media.",
      },
    },
    {
      "@type": "Question",
      name: "Can I add a photo to every state?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! You can upload a unique photo for each of all 50 states. Your progress is automatically saved in your browser so you can come back anytime.",
      },
    },
    {
      "@type": "Question",
      name: "Does the map maker work on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the map maker works on mobile devices including iPhone and Android. You can tap states, upload photos from your camera roll, and download your finished map.",
      },
    },
    {
      "@type": "Question",
      name: "Can I order a printed canvas of my map?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! After downloading your map, you can order it as a canvas print. There's an 'Order as Canvas Print' button that takes you directly to a printing service.",
      },
    },
  ],
};

export default function MapMakerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-cloud pt-18 sm:pt-20">
        <div className="mx-auto w-full max-w-[2200px] px-1 py-2 sm:px-3 sm:py-6 xl:px-4">
          <MapMakerEmbed />
        </div>

        <section className="space-y-6 px-3 pb-12 pt-1 sm:pt-2 xl:px-4">
          <div className="mx-auto w-full max-w-[1800px] rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-deep">
                  Quick tips
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-asphalt sm:text-3xl">
                  A cleaner way to build your map.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {QUICK_STEPS.map((step, index) => (
                  <div key={step} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-sm font-black text-amber-deep">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-asphalt/75 sm:text-base">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1800px] rounded-[2rem] border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-white to-sky-50/40 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-deep">After you love your map</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-asphalt sm:text-3xl">
                Turn it into something you can share — and come back to.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-asphalt/72">
                The download is yours forever. When you&apos;re ready, save the same journey to a{" "}
                <strong className="text-asphalt/88">live traveler page</strong>: one link for family, a map that still holds your
                photos, and room to remember what each state meant.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {SHARE_JOURNEY_STEPS.map((step, index) => (
                <div key={step.title} className="flex flex-col rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-night text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm font-bold text-asphalt">{step.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-asphalt/70">{step.body}</p>
                  {step.href && step.cta ? (
                    <Link
                      href={step.href}
                      className="mt-4 inline-flex w-fit rounded-full border border-asphalt/15 bg-asphalt px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-night"
                    >
                      {step.cta}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
