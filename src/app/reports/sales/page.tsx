import { getSalesReport } from "@/actions/reports";
import { SalesReportView } from "./_components/sales-report-view";

interface Props {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }>;
}

export default async function SalesReportPage({ searchParams }: Props) {
  const { startDate, endDate, customerId } = await searchParams;

  // Default: bulan ini
  const today = new Date();
  const defaultStart =
    startDate ||
    new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const defaultEnd = endDate || today.toISOString().split("T")[0];

  const report = await getSalesReport(defaultStart, defaultEnd, customerId);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Laporan Penjualan
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Detail transaksi penjualan per periode
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SalesReportView
            report={report}
            defaultStartDate={defaultStart}
            defaultEndDate={defaultEnd}
          />
        </div>
      </div>
    </main>
  );
}
