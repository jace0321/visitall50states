import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardProfileEditor from "./DashboardProfileEditor";

export default function DashboardEditPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[linear-gradient(180deg,#edf2f7_0%,#f7f4ee_46%,#f8fafc_100%)] pt-20 text-asphalt">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-12 lg:py-14">
          <DashboardProfileEditor />
        </div>
      </main>
      <Footer />
    </>
  );
}
