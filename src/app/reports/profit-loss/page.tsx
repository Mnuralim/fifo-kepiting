import { getProfitLossReport } from "@/actions/reports";
import { ProfitLossReportView } from "./_components/profit-lost-view";

interface Props {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ProfitLossReportPage({ searchParams }: Props) {
  const { startDate, endDate } = await searchParams;

  const today = new Date();
  const defaultStart =
    startDate ||
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const defaultEnd = endDate || today.toISOString().split("T")[0];

  const report = await getProfitLossReport(defaultStart, defaultEnd);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <h1 className="text-xl font-semibold text-slate-900">
            Laporan Laba Rugi
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Analisis profit margin dan performa produk
          </p>
        </div>
        <div className="p-6">
          <ProfitLossReportView
            report={report}
            defaultStartDate={defaultStart}
            defaultEndDate={defaultEnd}
          />
        </div>
      </div>
    </main>
  );
}
