"use client";

import { predictHarvest } from "@/actions/train";
import type { Weather } from "@prisma/client";
import { Loader2, Fish, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

interface Props {
  weathers: Weather[];
}

export const PredictForm = ({ weathers }: Props) => {
  const [state, action, pending] = useActionState(predictHarvest, {
    message: "",
    success: false,
  });

  const router = useRouter();

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="weatherValue"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Kondisi Cuaca
            </label>
            <select
              id="weatherValue"
              name="weatherValue"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">-- Pilih Kondisi Cuaca --</option>
              {weathers.map((weather) => (
                <option key={weather.numericValue} value={weather.numericValue}>
                  {weather.name} ({weather.numericValue})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="productionCost"
              className="flex items-center gap-2 text-sm font-semibold text-gray-700"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Biaya Produksi (Rp)
            </label>
            <input
              type="number"
              id="productionCost"
              name="productionCost"
              placeholder="Contoh: 500000"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {pending ? (
            <span className="flex items-center gap-3 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memproses Prediksi...</span>
            </span>
          ) : (
            <span className="flex items-center gap-3 justify-center">
              <Fish className="w-5 h-5" />
              <span>Prediksi Hasil Panen</span>
            </span>
          )}
        </button>
      </form>

      {state.message && !state.success && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-red-800 font-medium mb-1">Terjadi Kesalahan</h4>
            <p className="text-red-700 text-sm">{state.message}</p>
          </div>
        </div>
      )}

      {state.data && state.success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  Hasil Prediksi Berhasil
                </h3>
                <p className="text-green-100 text-sm">
                  Prediksi berdasarkan data yang Anda masukkan
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-3 bg-white rounded-xl p-4 shadow-md border border-green-200 mb-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <Fish className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Estimasi Hasil Panen
                    </p>
                    <p className="text-3xl font-bold text-gray-800">
                      {state.data.predictedHarvest}
                      <span className="text-lg font-medium text-gray-600 ml-2">
                        KG
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">💡 Catatan:</p>
                  <p className="text-sm text-gray-600">
                    Hasil prediksi dapat berubah berdasarkan kondisi cuaca
                    aktual dan faktor lingkungan lainnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-green-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.refresh()}
                  className="flex-1 px-4 py-2 bg-white border border-green-300 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors duration-200"
                >
                  Prediksi Ulang
                </button>
                <button
                  onClick={() => {
                    const result = `Prediksi Hasil Panen Ikan Teri: ${state.data?.predictedHarvest} KG`;
                    navigator.clipboard.writeText(result);
                    alert("Hasil prediksi telah disalin!");
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Salin Hasil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
