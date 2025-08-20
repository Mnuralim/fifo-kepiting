import { getStats } from "@/actions/stats";
import { Dashboard } from "./_components/stats";

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8 min-h-screen bg-slate-50">
      <Dashboard
        totalHarvestRecords={stats.totalHarvestRecords}
        totalWeatherTypes={stats.totalWeatherTypes}
        totalPredictions={stats.totalPredictions}
        activeModels={stats.activeModels}
        avgHarvestAmount={stats.avgHarvestAmount}
        lastTrainingDate={stats.lastTrainingDate}
        recentPredictions={stats.recentPredictions}
      />
    </div>
  );
}
