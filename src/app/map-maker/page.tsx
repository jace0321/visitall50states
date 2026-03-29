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
  title: "Free 50 State Photo Map Maker",
  description:
    "Create your own 50 state photo map for free! Upload your travel photos, position them perfectly, and download a beautiful map of your adventures across America.",
};

export default function MapMakerPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto w-full max-w-[2200px] px-2 py-6 sm:px-3 xl:px-4">
          <MapMakerEmbed />
        </div>

        <section className="px-3 pb-12 pt-2 xl:px-4">
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
