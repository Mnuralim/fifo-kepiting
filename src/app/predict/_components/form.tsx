"use client";

import { predictHarvest } from "@/actions/train";
import type { Weather } from "@prisma/client";
import {
  Loader2,
  Fish,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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

  // Fungsi untuk menentukan kategori hasil panen
  const getHarvestCategory = (harvest: number) => {
    if (harvest <= 0) {
      return {
        level: "critical",
        label: "Tidak Layak Panen",
        color: "red",
        icon: AlertTriangle,
      };
    } else if (harvest < 50) {
      return {
        level: "low",
        label: "Hasil Sangat Rendah",
        color: "orange",
        icon: TrendingDown,
      };
    } else if (harvest < 100) {
      return {
        level: "medium",
        label: "Hasil Cukup",
        color: "yellow",
        icon: Fish,
      };
    } else {
      return {
        level: "good",
        label: "Hasil Optimal",
        color: "green",
        icon: TrendingUp,
      };
    }
  };

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
              required
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
              required
              min="0"
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

      {state.data &&
        state.success &&
        (() => {
          const category = getHarvestCategory(state.data.predictedHarvest);
          const CategoryIcon = category.icon;

          return (
            <>
              {/* Peringatan Khusus jika hasil prediksi <= 0 atau sangat rendah */}
              {state.data.predictedHarvest <= 0 ? (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          ⚠️ Kondisi Tidak Layak Panen
                        </h3>
                        <p className="text-red-100 text-sm">
                          Hasil panen diprediksi nol atau negatif - tidak
                          menguntungkan
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="bg-white rounded-xl p-5 border border-red-200 mb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-red-900 font-bold text-xl mb-2">
                            Hasil Prediksi:{" "}
                            {state.data.predictedHarvest.toFixed(2)} KG
                          </h4>
                          <p className="text-red-800 text-sm leading-relaxed">
                            Berdasarkan data cuaca dan biaya produksi yang
                            dimasukkan, sistem memprediksi hasil panen yang
                            tidak menguntungkan.
                            <strong>
                              {" "}
                              Sangat disarankan untuk TIDAK melanjutkan
                              aktivitas panen.
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-orange-200 mb-4">
                      <h4 className="text-orange-900 font-semibold mb-3 flex items-center gap-2">
                        <span className="text-lg">🚫</span>
                        Mengapa Hasil Prediksi Rendah/Negatif?
                      </h4>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Kondisi cuaca yang sangat buruk untuk panen ikan
                            teri
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Biaya produksi terlalu rendah dibanding kebutuhan
                            minimum
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Kombinasi faktor cuaca dan biaya tidak optimal
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                      <h4 className="text-blue-900 font-semibold mb-3 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Rekomendasi Tindakan:
                      </h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 font-bold">
                            1.
                          </span>
                          <span>
                            <strong>TUNDA aktivitas panen</strong> hingga
                            kondisi cuaca membaik
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 font-bold">
                            2.
                          </span>
                          <span>
                            <strong>Tingkatkan biaya produksi</strong> dengan
                            menambah pakan, perawatan, atau sumber daya lainnya
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 font-bold">
                            3.
                          </span>
                          <span>
                            Pantau kondisi cuaca dan coba prediksi ulang ketika
                            cuaca lebih baik
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 font-bold">
                            4.
                          </span>
                          <span>
                            Konsultasikan dengan <strong>ahli perikanan</strong>{" "}
                            atau sesama nelayan berpengalaman
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1 font-bold">
                            5.
                          </span>
                          <span>
                            Pertimbangkan strategi alternatif atau menunggu
                            musim panen yang lebih baik
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-red-200">
                      <button
                        onClick={() => router.refresh()}
                        className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        🔄 Coba Prediksi dengan Data Berbeda
                      </button>
                    </div>
                  </div>
                </div>
              ) : state.data.predictedHarvest < 50 ? (
                /* Peringatan untuk hasil sangat rendah (0-50 KG) */
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <TrendingDown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          ⚠️ Hasil Panen Sangat Rendah
                        </h3>
                        <p className="text-yellow-100 text-sm">
                          Produktivitas di bawah target optimal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="bg-white rounded-xl p-5 border border-yellow-200 mb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <TrendingDown className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-yellow-900 font-bold text-2xl mb-2">
                            {state.data.predictedHarvest.toFixed(2)} KG
                          </h4>
                          <p className="text-yellow-800 text-sm leading-relaxed">
                            Hasil panen diprediksi sangat rendah. Meskipun masih
                            ada hasil, produktivitas jauh di bawah target
                            optimal (minimum 50 KG).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-orange-200">
                      <h4 className="text-orange-900 font-semibold mb-3 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Saran Perbaikan:
                      </h4>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Evaluasi <strong>biaya produksi</strong> -
                            pertimbangkan peningkatan investasi
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Tunggu kondisi cuaca yang lebih baik untuk hasil
                            maksimal
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>
                            Pertimbangkan apakah hasil ini masih menguntungkan
                            secara ekonomi
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-yellow-200">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => router.refresh()}
                          className="flex-1 px-4 py-2 bg-white border border-yellow-300 text-yellow-700 font-medium rounded-lg hover:bg-yellow-50 transition-colors duration-200"
                        >
                          Prediksi Ulang
                        </button>
                        <button
                          onClick={() => {
                            const result = `⚠️ Prediksi Hasil Panen Ikan Teri: ${state.data?.predictedHarvest.toFixed(
                              2
                            )} KG (Sangat Rendah - Perlu Evaluasi)`;
                            navigator.clipboard.writeText(result);
                            alert("Hasil prediksi telah disalin!");
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors duration-200"
                        >
                          Salin Hasil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tampilan Normal untuk hasil yang baik (> 50 KG) */
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-full p-2">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          ✅ {category.label}
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
                            <CategoryIcon className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 font-medium">
                              Estimasi Hasil Panen
                            </p>
                            <p className="text-3xl font-bold text-gray-800">
                              {state.data.predictedHarvest.toFixed(2)}
                              <span className="text-lg font-medium text-gray-600 ml-2">
                                KG
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">
                            💡 Catatan:
                          </p>
                          <p className="text-sm text-gray-600">
                            Hasil prediksi dapat berubah berdasarkan kondisi
                            cuaca aktual dan faktor lingkungan lainnya.
                          </p>
                        </div>

                        {state.data.predictedHarvest >= 100 && (
                          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
                            <p className="text-xs text-green-700 mb-1 font-semibold">
                              🎉 Hasil Optimal!
                            </p>
                            <p className="text-sm text-green-800">
                              Kondisi sangat baik untuk panen. Pastikan
                              persiapan maksimal!
                            </p>
                          </div>
                        )}
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
                            const result = `✅ Prediksi Hasil Panen Ikan Teri: ${state.data?.predictedHarvest.toFixed(
                              2
                            )} KG (${category.label})`;
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
            </>
          );
        })()}
    </div>
  );
};
