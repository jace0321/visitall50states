import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardSettingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-asphalt">Settings</h1>
            <p className="mt-3 text-asphalt/65">Scaffold placeholder for privacy, account settings, and defaults.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
