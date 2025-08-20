"use client";

import { trainRegressionModel } from "@/actions/train";
import { Alert } from "@/app/_components/alert";
import type { RegressionCoefficients } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useActionState, type JSX } from "react";

interface Props {
  regressionCoefficient: RegressionCoefficients | null;
  alertType?: "success" | "error";
  message?: string;
}

const formatCoefficient = (value: number): JSX.Element | string => {
  if (Math.abs(value) >= 1) {
    return value.toFixed(2);
  } else if (Math.abs(value) >= 0.01) {
    return value.toFixed(4);
  } else {
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = (value / Math.pow(10, exponent)).toFixed(2);
    return (
      <span>
        {mantissa} × 10<sup>{exponent}</sup>
      </span>
    );
  }
};

const formatMetric = (value: number, type: "rmse" | "percentage"): string => {
  if (type === "percentage") {
    return value.toFixed(2);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  } else if (value >= 1) {
    return value.toFixed(2);
  } else {
    return value.toFixed(4);
  }
};

export const TrainModel = ({
  regressionCoefficient,
  alertType,
  message,
}: Props) => {
  const [, action, isPending] = useActionState(trainRegressionModel, null);
  const router = useRouter();

  const handleCloseAlert = () => {
    router.replace("/train", { scroll: false });
  };

  return (
    <div>
      <div className="mb-8">
        <form action={action}>
          <button
            className={`px-4 py-2.5 rounded-lg font-semibold text-white transition-all duration-200 ${
              isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isPending ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Melatih Model...
              </div>
            ) : (
              "Latih Model"
            )}
          </button>
        </form>
      </div>
      {!regressionCoefficient ? (
        <div className="mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Model Regresi Linear Tidak Terdeteksi
          </h1>
          <p className="text-gray-600">
            Silakan lakukan pelatihan model terlebih dahulu untuk memulai.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Hasil Training Model
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Intercept (b₀)
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCoefficient(regressionCoefficient.intercept)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Koefisien Cuaca (b₁)
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCoefficient(regressionCoefficient.weatherCoeff)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Koefisien Biaya Produksi (b₂)
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCoefficient(regressionCoefficient.productionCostCoeff)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                R-Squared
              </h3>
              <p className="text-xl font-bold text-indigo-600">
                {formatMetric(
                  (regressionCoefficient.rSquared as number) * 100,
                  "percentage"
                )}
                %
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">RMSE</h3>
              <p className="text-xl font-bold text-red-600">
                {regressionCoefficient.rmse
                  ? formatMetric(regressionCoefficient.rmse, "rmse")
                  : "N/A"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">MAPE</h3>
              <p className="text-xl font-bold text-orange-600">
                {regressionCoefficient.mape
                  ? formatMetric(regressionCoefficient.mape, "percentage")
                  : "N/A"}
                %
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Jumlah Data
              </h3>
              <p className="text-xl font-bold text-gray-600">
                {regressionCoefficient.trainingDataCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Persamaan Regresi:
            </h3>
            <p className="text-blue-700 font-mono text-sm md:text-base">
              Hasil Panen = {formatCoefficient(regressionCoefficient.intercept)}{" "}
              + ({formatCoefficient(regressionCoefficient.weatherCoeff)} ×
              Cuaca) + (
              {formatCoefficient(regressionCoefficient.productionCostCoeff)} ×
              Biaya Produksi)
            </p>
          </div>
        </div>
      )}
      <Alert
        isVisible={message !== undefined}
        message={(message as string) || ""}
        onClose={handleCloseAlert}
        type={(alertType as "success" | "error") || "success"}
        autoClose
      />
    </div>
  );
};
