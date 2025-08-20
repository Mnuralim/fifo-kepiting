"use client";

import React from "react";
import {
  FileSpreadsheet,
  // LineChart,
  Cloud,
  TrendingUp,
  Activity,
  // Clock,
  TestTube,
  Cpu,
  Target,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Props {
  totalHarvestRecords: number;
  totalWeatherTypes: number;
  totalPredictions: number;
  activeModels: number;
  avgHarvestAmount: number;
  lastTrainingDate: Date | null;
  recentPredictions: {
    id: string;
    date: Date;
    weather: string;
    productionCost: number;
    predictionValue: number;
    modelUsed: string;
    createdAt: Date;
  }[];
}

export const Dashboard = ({
  totalHarvestRecords,
  totalWeatherTypes,
  totalPredictions,
  activeModels,
  avgHarvestAmount,
  lastTrainingDate,
}: // recentPredictions,
Props) => {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-600">
          Sistem Prediksi Hasil Panen dengan Regresi Linear
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Data Hasil Panen
              </p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalHarvestRecords}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Jenis Cuaca</p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalWeatherTypes}
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Model Aktif</p>
              <p className="text-2xl font-semibold text-slate-800">
                {activeModels}
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Prediksi
              </p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalPredictions}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Performa Model
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                Rata-rata Hasil Panen
              </span>
              <span className="text-lg font-semibold text-slate-800">
                {avgHarvestAmount.toFixed(2)} kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Terakhir Dilatih</span>
              <span className="text-sm text-slate-700">
                {lastTrainingDate
                  ? formatDate(lastTrainingDate, true)
                  : "Belum ada pelatihan"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Status Sistem
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  activeModels > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-slate-700">
                {activeModels > 0
                  ? "Model Siap Prediksi"
                  : "Tidak Ada Model Aktif"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  totalHarvestRecords >= 10 ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-slate-700">
                {totalHarvestRecords >= 10
                  ? "Data Cukup untuk Pelatihan"
                  : "Data Masih Terbatas"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Prediksi Terbaru
            </h3>
          </div>
          <div className="space-y-4">
            {recentPredictions.length > 0 ? (
              recentPredictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LineChart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-800">
                        Prediksi Hasil Panen
                      </h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {prediction.weather}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Tanggal:</span>{" "}
                        {formatDate(prediction.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Biaya:</span> Rp{" "}
                        {prediction.productionCost.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Prediksi:</span>{" "}
                        {prediction.predictionValue.toFixed(2)} kg
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500">
                        Model: {prediction.modelUsed}
                      </p>
                      <span className="text-xs text-slate-400">•</span>
                      <p className="text-xs text-slate-500">
                        {formatDate(prediction.createdAt, true)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <LineChart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Belum ada prediksi yang dibuat</p>
              </div>
            )}
          </div>
        </div>
      </div> */}

      <div className="mt-0">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group">
              <Link href={"/harvests?modal=add"} className="w-full h-full">
                <FileSpreadsheet className="w-6 h-6 text-slate-600 group-hover:text-green-600 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-800">
                  Input Data Panen
                </p>
              </Link>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group">
              <Link href={"/train"} className="w-full h-full">
                <Cpu className="w-6 h-6 text-slate-600 group-hover:text-violet-600 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-800">
                  Latih Model
                </p>
              </Link>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group">
              <Link href={"/test"} className="w-full h-full">
                <TestTube className="w-6 h-6 text-slate-600 group-hover:text-blue-600 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-800">Uji Model</p>
              </Link>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group">
              <Link href={"/predict"} className="w-full h-full">
                <TrendingUp className="w-6 h-6 text-slate-600 group-hover:text-amber-600 mb-2 transition-colors" />
                <p className="text-sm font-medium text-slate-800">
                  Buat Prediksi
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
