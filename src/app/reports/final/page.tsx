import { getAllFinalReports } from "@/actions/reports";
import { FinalReportsList } from "./_components/final-reports-list";

export default async function FinalReportsPage() {
  const reports = await getAllFinalReports();

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <h1 className="text-xl font-semibold text-slate-900">
            Laporan Final
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Laporan periodik yang sudah disimpan
          </p>
        </div>
        <div className="p-6">
          <FinalReportsList reports={reports} />
        </div>
      </div>
    </main>
  );
}
