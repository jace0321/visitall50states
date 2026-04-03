import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-deep">Search layer</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-asphalt">Search traveler tips, stories, and state notes</h1>
            <p className="mt-4 text-asphalt/65">Scaffold placeholder for future global search across official guides, traveler profiles, state entries, and comments.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
