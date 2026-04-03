import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardStateEditorPage({ params }: { params: { stateCode: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud pt-20">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-asphalt">Edit state entry: {params.stateCode}</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-cloud p-4">Status / title / summary</div>
              <div className="rounded-2xl bg-cloud p-4">Date / rating / trip type</div>
              <div className="rounded-2xl bg-cloud p-4 md:col-span-2">Story / favorite memory / hidden gem / best stop / best food</div>
              <div className="rounded-2xl bg-cloud p-4">Checklist: capital, capitol building, parks</div>
              <div className="rounded-2xl bg-cloud p-4">Photos + captions + visibility</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
