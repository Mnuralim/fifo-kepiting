import { getStockReport } from "@/actions/reports";
import { getAllCrabs } from "@/actions/crabs";
import { StockReportView } from "./_components/stock-report-view";

interface Props {
  searchParams: Promise<{
    crabId?: string;
  }>;
}

export default async function StockReportPage({ searchParams }: Props) {
  const { crabId } = await searchParams;

  const [report, crabsData] = await Promise.all([
    getStockReport(crabId),
    getAllCrabs("1000", "0"),
  ]);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <h1 className="text-xl font-semibold text-slate-900">Laporan Stok</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor stok tersedia dan nilai persediaan
          </p>
        </div>
        <div className="p-6">
          <StockReportView report={report} crabs={crabsData.crabs} />
        </div>
      </div>
    </main>
  );
}
