import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TravelerMap from "@/components/community/TravelerMap";
import { demoMapStates, demoProfile } from "@/lib/community/mock-data";

export default function DashboardMapPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <TravelerMap username={demoProfile.username} states={demoMapStates} />
        </div>
      </main>
      <Footer />
    </>
  );
}
