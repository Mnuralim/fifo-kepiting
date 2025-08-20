"use server";

import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

export interface RegressionOutput {
  date: Date;
  weather: string;
  weatherValue: number;
  cost: number;
  actualHarvestAmount: number;
  predict: number;
  error: number;
  absError: number;
  errorSquared: number;
  pe: number;
  [key: string]: unknown;
}

export interface RegressionResult {
  data: RegressionOutput[];
  rmse: number;
  mape: number;
  totalDataPoints: number;
  modelUsed: string;
}

export const performMultipleRegression = unstable_cache(
  async function performMultipleRegression(
    sortBy?: string,
    startDate?: string,
    endDate?: string,
    sortOrder?: string
  ): Promise<RegressionResult> {
    try {
      const activeModel = await prisma.regressionCoefficients.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          trainedAt: "desc",
        },
      });

      if (!activeModel) {
        return {
          data: [],
          rmse: 0,
          mape: 0,
          totalDataPoints: 0,
          modelUsed: "",
        };
      }

      const whereConditions: Prisma.HarvestRecordWhereInput[] = [];
      if (startDate && endDate) {
        whereConditions.push({
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        });
      }

      let orderBy: Prisma.HarvestRecordOrderByWithRelationInput;
      if (sortBy && sortOrder) {
        orderBy = {
          [sortBy]: sortOrder === "desc" ? "desc" : "asc",
        };
      } else {
        orderBy = {
          date: "asc",
        };
      }

      const harvests = await prisma.harvestRecord.findMany({
        where: {
          AND: whereConditions,
          weather: {
            isNot: null,
          },
        },
        include: {
          weather: true,
        },
        orderBy,
      });

      if (harvests.length === 0) {
        return {
          data: [],
          rmse: 0,
          mape: 0,
          totalDataPoints: 0,
          modelUsed: activeModel.modelName,
        };
      }

      const regressionData: RegressionOutput[] = [];
      let totalSquaredError = 0;
      let totalAbsolutePercentageError = 0;

      for (const harvest of harvests) {
        if (!harvest.weather) continue;

        // Rumus regresi linear berganda: Y = b0 + b1*X1 + b2*X2
        // Y = hasil panen, X1 = cuaca (numeric), X2 = biaya produksi
        const weatherValue = harvest.weather.numericValue;
        const productionCost = harvest.productionCost;

        const prediction =
          activeModel.intercept +
          activeModel.weatherCoeff * weatherValue +
          activeModel.productionCostCoeff * productionCost;

        const actualValue = harvest.harvestAmount;
        const error = actualValue - prediction;
        const absError = Math.abs(error);
        const errorSquared = error * error;

        // Percentage Error (PE) = (|Actual - Predicted| / Actual) * 100
        const pe =
          actualValue !== 0 ? (absError / Math.abs(actualValue)) * 100 : 0;
        regressionData.push({
          date: harvest.date,
          weather: harvest.weather.name,
          weatherValue: weatherValue,
          cost: productionCost,
          actualHarvestAmount: actualValue,
          predict: Math.round(prediction * 100) / 100,
          error: Math.round(error * 100) / 100,
          absError: Math.round(absError * 100) / 100,
          errorSquared: Math.round(errorSquared * 100) / 100,
          pe: Math.round(pe * 100) / 100,
        });

        totalSquaredError += errorSquared;
        totalAbsolutePercentageError += pe;
      }

      const n = regressionData.length;
      const rmse = n > 0 ? Math.sqrt(totalSquaredError / n) : 0;
      const mape = n > 0 ? totalAbsolutePercentageError / n : 0;

      return {
        data: regressionData,
        rmse: Math.round(rmse * 100) / 100,
        mape: Math.round(mape * 100) / 100,
        totalDataPoints: n,
        modelUsed: activeModel.modelName,
      };
    } catch (error) {
      console.error("Error in multiple regression:", error);
      throw new Error(
        `Failed to perform regression analysis: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);
