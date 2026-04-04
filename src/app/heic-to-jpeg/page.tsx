import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeicToJpegConverter from "@/components/HeicToJpegConverter";

export const metadata: Metadata = {
  title: "Free HEIC to JPEG Converter — iPhone Photos",
  description:
    "Convert iPhone HEIC or HEIF photos to JPEG in one step. Free tool from Visit All 50 States for your travel map and sharing.",
  alternates: { canonical: "https://visitall50states.com/heic-to-jpeg" },
  openGraph: {
    title: "Free HEIC to JPEG Converter",
    description: "Turn iPhone HEIC/HEIF files into JPEGs for any map, site, or print workflow.",
    url: "https://visitall50states.com/heic-to-jpeg",
    type: "website",
  },
};

export default function HeicToJpegPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-night pt-24 pb-20 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/80">
            Free · No account
          </p>
          <h1 className="text-center text-3xl font-black tracking-tight sm:text-4xl">
            HEIC to JPEG
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-white/70">
            iPhone photos are often saved as <strong className="text-white/88">HEIC</strong>. Many sites and editors want{" "}
            <strong className="text-white/88">JPEG</strong> instead. Drop your file here, download a{" "}
            <strong className="text-white/88">.jpg</strong>, then use it in our{" "}
            <Link href="/map-maker" className="font-semibold text-amber-brand underline-offset-2 hover:underline">
              photo map maker
            </Link>
            .
          </p>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-white/55">
            <span className="font-semibold text-white/70">Accepts for now:</span> HEIC or HEIF · max{" "}
            <span className="text-white/75">25 MB</span> per file · output is always JPEG. Some HEIC variants may still fail; if so,
            export as JPEG from the Photos app.
          </p>

          <div className="mt-10">
            <HeicToJpegConverter />
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm leading-relaxed text-white/55">
            <p className="font-semibold text-white/75">Why this exists</p>
            <p className="mt-2">
              Browsers and some tools don&apos;t read every HEIC variant. Converting to JPEG first avoids upload errors when you&apos;re
              building your 50-state map.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
