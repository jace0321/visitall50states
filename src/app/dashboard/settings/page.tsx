import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Settings",
  description: "How your Visit All 50 States account, public traveler page, and map work together.",
};

export default function DashboardSettingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="font-heading text-3xl font-extrabold text-asphalt">Settings &amp; how it works</h1>
          <p className="mt-3 text-asphalt/65">
            Quick reference for what visitors see, where to edit, and how your map stays in sync.
          </p>

          <section className="mt-10 space-y-8">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-asphalt">Public traveler page</h2>
              <p className="mt-3 text-sm leading-7 text-asphalt/70">
                When your profile is <strong className="font-semibold text-asphalt">public</strong>, anyone with your link can open{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/travelers/yourusername</code>. They see your U.S. map;
                states with a saved journal (and photos or videos) are clickable and open that state&apos;s story.
              </p>
              <Link
                href="/dashboard/edit"
                className="mt-4 inline-flex text-sm font-bold text-amber-900 hover:underline"
              >
                Edit profile &amp; visibility →
              </Link>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-asphalt">Map &amp; photos</h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-asphalt/70">
                <li>
                  <Link href="/map-maker" className="font-semibold text-amber-900 hover:underline">
                    Map maker
                  </Link>{" "}
                  — mark visited states and place photos; sync pushes states to your saved map.
                </li>
                <li>
                  <Link href="/dashboard" className="font-semibold text-amber-900 hover:underline">
                    Dashboard
                  </Link>{" "}
                  — preview the same map visitors see (when public).
                </li>
                <li>
                  Open any state from the dashboard list to add the full journal, captions, and media that power the public state
                  page.
                </li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-asphalt">Account</h2>
              <p className="mt-3 text-sm leading-7 text-asphalt/70">
                Sign out from the <strong className="font-semibold text-asphalt">Account</strong> menu in the site header. For
                account or data questions, use the contact path you publish on your About page.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
