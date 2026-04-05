import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Photos & media",
  description: "Where trip photos and videos live on your Visit All 50 States journal.",
};

export default function DashboardPhotosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="font-heading text-3xl font-extrabold text-asphalt">Photos &amp; videos</h1>
          <p className="mt-3 text-asphalt/65">
            Media is organized <strong className="font-semibold text-asphalt">per state</strong> on your traveler journal — not in one
            giant bucket. That way each state page and map thumbnail stays tied to the right trip.
          </p>

          <div className="mt-10 space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="font-bold text-asphalt">Map maker photos</h2>
              <p className="mt-2 text-sm leading-7 text-asphalt/70">
                Images you place on the U.S. map in the{" "}
                <Link href="/map-maker" className="font-semibold text-amber-900 hover:underline">
                  map maker
                </Link>{" "}
                can sync into your journal (when you use the sync action there). They help fill state shapes on your public map.
              </p>
            </div>
            <div>
              <h2 className="font-bold text-asphalt">State journals</h2>
              <p className="mt-2 text-sm leading-7 text-asphalt/70">
                For full galleries, captions, reordering, and video, open{" "}
                <Link href="/dashboard" className="font-semibold text-amber-900 hover:underline">
                  Dashboard
                </Link>
                , pick a state, and use the media section in the state editor.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
