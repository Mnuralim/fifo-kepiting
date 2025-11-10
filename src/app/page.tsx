import { getStats } from "@/actions/stats";
import { Dashboard } from "./_components/dashboard";

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 min-h-screen bg-slate-50">
      <Dashboard
        totalCrabs={stats.totalCrabs}
        totalCustomers={stats.totalCustomers}
        totalSales={stats.totalSales}
        totalStocks={stats.totalStocks}
        avgGrossProfit={stats.avgGrossProfit}
        totalRevenue={stats.totalRevenue}
        totalCOGS={stats.totalCOGS}
        totalGrossProfit={stats.totalGrossProfit}
        lowStockCount={stats.lowStockCount}
        recentSales={stats.recentSales}
      />
    </div>
  );
}
