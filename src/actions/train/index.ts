"use server";

import { MultipleLinearRegression } from "@/lib/mlr";
import prisma from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";

export interface TrainingResult {
  success: boolean;
  message: string;
  data?: {
    intercept: number;
    weatherCoeff: number;
    productionCostCoeff: number;
    mape: number;
    pe: number;
    rSquared: number;
    rmse: number;
    trainingDataCount: number;
  };
}

export interface PredictionInput {
  weatherValue: number;
  productionCost: number;
}

export interface PredictionResult {
  success: boolean;
  message: string;
  data?: {
    predictedHarvest: number;
    weatherValue: number;
    productionCost: number;
    modelUsed: {
      intercept: number;
      weatherCoeff: number;
      productionCostCoeff: number;
    };
  };
}

export async function trainRegressionModel() {
  try {
    const trainingData = await prisma.harvestRecord.findMany({
      include: {
        weather: true,
      },
      skip: 0,
      orderBy: {
        date: "asc",
      },
    });

    if (trainingData.length < 3) {
      throw new Error("Data training tidak mencukupi.");
    }

    const validData = trainingData.filter((record) => record.weather);

    if (validData.length < 3) {
      throw new Error("Data training tidak mencukupi setelah filter.");
    }

    const X: number[][] = [];
    const y: number[] = [];

    validData.forEach((record) => {
      X.push([1, record.weather!.numericValue, record.productionCost]);
      y.push(record.harvestAmount);
    });

    const mlr = new MultipleLinearRegression();
    const result = mlr.train(X, y);

    const modelName = "harvest_prediction_model";

    await prisma.regressionCoefficients.upsert({
      where: { modelName },
      update: {
        intercept: result.intercept,
        weatherCoeff: result.weatherCoeff,
        productionCostCoeff: result.productionCostCoeff,
        mape: result.metrics.mape,
        pe: result.metrics.pe,
        rSquared: result.metrics.rSquared,
        rmse: result.metrics.rmse,
        trainingDataCount: validData.length,
        trainedAt: new Date(),
        isActive: true,
      },
      create: {
        modelName,
        intercept: result.intercept,
        weatherCoeff: result.weatherCoeff,
        productionCostCoeff: result.productionCostCoeff,
        mape: result.metrics.mape,
        pe: result.metrics.pe,
        rSquared: result.metrics.rSquared,
        rmse: result.metrics.rmse,
        trainingDataCount: validData.length,
        trainedAt: new Date(),
        isActive: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      redirect(`/train?error=1&message=${error.message}`);
    } else {
      redirect(`/train?error=1&message=Terjadi kesalahan saat melatih model`);
    }
  } finally {
    await prisma.$disconnect();
  }
  revalidatePath("/train");
  revalidatePath("/test");
  revalidatePath("/predict");
  redirect(`/train?success=1&message=Model berhasil dilatih`);
}

export async function predictHarvest(
  formState: PredictionResult,
  formData: FormData
): Promise<PredictionResult> {
  try {
    const input: PredictionInput = {
      weatherValue: parseFloat(formData.get("weatherValue") as string),
      productionCost: parseFloat(formData.get("productionCost") as string),
    };

    if (
      isNaN(input.weatherValue) ||
      isNaN(input.productionCost) ||
      input.weatherValue < 0 ||
      input.productionCost < 0
    ) {
      throw new Error(
        "Nilai cuaca dan biaya produksi harus berupa angka positif."
      );
    }

    const currentModel = await getCurrentModel();

    if (!currentModel) {
      throw new Error(
        "Model belum dilatih. Silakan latih model terlebih dahulu."
      );
    }

    const mlr = new MultipleLinearRegression();
    mlr.loadCoefficients([
      currentModel.intercept,
      currentModel.weatherCoeff,
      currentModel.productionCostCoeff,
    ]);

    const predictedHarvest = mlr.predictSingle(
      input.weatherValue,
      input.productionCost
    );

    return {
      success: true,
      message: "Prediksi berhasil dilakukan",
      data: {
        predictedHarvest: Math.round(predictedHarvest * 100) / 100,
        weatherValue: input.weatherValue,
        productionCost: input.productionCost,
        modelUsed: {
          intercept: currentModel.intercept,
          weatherCoeff: currentModel.weatherCoeff,
          productionCostCoeff: currentModel.productionCostCoeff,
        },
      },
    };
  } catch (error) {
    console.error("Error predicting harvest:", error);
    return {
      success: false,
      message: `Terjadi kesalahan saat melakukan prediksi: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function predictHarvestBatch(inputs: PredictionInput[]): Promise<{
  success: boolean;
  message: string;
  data?: Array<{
    weatherValue: number;
    productionCost: number;
    predictedHarvest: number;
  }>;
}> {
  try {
    const currentModel = await getCurrentModel();

    if (!currentModel) {
      return {
        success: false,
        message: "Model belum dilatih. Silakan latih model terlebih dahulu.",
      };
    }

    const mlr = new MultipleLinearRegression();
    mlr.loadCoefficients([
      currentModel.intercept,
      currentModel.weatherCoeff,
      currentModel.productionCostCoeff,
    ]);

    const X = inputs.map((input) => [
      1,
      input.weatherValue,
      input.productionCost,
    ]);

    const predictions = mlr.predict(X);

    const results = inputs.map((input, index) => ({
      weatherValue: input.weatherValue,
      productionCost: input.productionCost,
      predictedHarvest: Math.round(predictions[index] * 100) / 100,
    }));

    return {
      success: true,
      message: `Berhasil melakukan ${inputs.length} prediksi`,
      data: results,
    };
  } catch (error) {
    console.error("Error predicting harvest batch:", error);
    return {
      success: false,
      message: `Terjadi kesalahan saat melakukan prediksi batch: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  } finally {
    await prisma.$disconnect();
  }
}
export const getCurrentModel = unstable_cache(async function getCurrentModel() {
  try {
    const model = await prisma.regressionCoefficients.findFirst({
      where: { isActive: true },
      orderBy: { trainedAt: "desc" },
    });

    return model;
  } catch (error) {
    console.error("Error fetching current model:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
});
