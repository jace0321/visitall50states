import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapMakerEmbed from "./MapMakerEmbed";

const QUICK_STEPS = [
  "Upload a favorite photo from the trip",
  "Drag and size it where it feels right",
  "Download a cleaner map you can keep or share",
];

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
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto w-full max-w-[2200px] px-1 py-2 sm:px-3 sm:py-6 xl:px-4">
          <MapMakerEmbed />
        </div>

        <section className="px-3 pb-12 pt-1 sm:pt-2 xl:px-4">
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
        </section>
      </main>
      <Footer />
    </>
  );
}
