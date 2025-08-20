"use server";

import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getStats = unstable_cache(
  async function getStats() {
    const [
      totalHarvestRecords,
      totalWeatherTypes,
      totalPredictions,
      activeModels,
      avgHarvestAmount,
      lastTrainingDate,
      recentPredictions,
    ] = await Promise.all([
      prisma.harvestRecord.count(),

      prisma.weather.count(),

      prisma.predictionLog.count(),

      prisma.regressionCoefficients.count({
        where: {
          isActive: true,
        },
      }),

      // Rata-rata hasil panen
      prisma.harvestRecord
        .aggregate({
          _avg: {
            harvestAmount: true,
          },
        })
        .then((result) => result._avg.harvestAmount || 0),

      // Tanggal pelatihan terakhir
      prisma.regressionCoefficients
        .findFirst({
          orderBy: {
            trainedAt: "desc",
          },
          select: {
            trainedAt: true,
          },
        })
        .then((result) => result?.trainedAt || null),

      prisma.predictionLog.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          date: true,
          weather: true,
          productionCost: true,
          predictionValue: true,
          modelUsed: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalHarvestRecords,
      totalWeatherTypes,
      totalPredictions,
      activeModels,
      avgHarvestAmount,
      lastTrainingDate,
      recentPredictions,
    };
  },
  ["dashboard-stats"],
  {
    revalidate: 300, // Cache selama 5 menit
  }
);
