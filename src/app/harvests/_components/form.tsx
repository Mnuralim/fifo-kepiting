"use client";

import { useActionState } from "react";
import { Calendar, Cloud, Wheat, DollarSign, Loader2 } from "lucide-react";
import { ErrorMessage } from "@/app/_components/error-message";
import type { Weather, Prisma } from "@prisma/client";
import { addHarvestRecord, updateHarvestRecord } from "@/actions/harvests";

interface Props {
  modal?: "add" | "edit";
  selectedHarvestRecord?: Prisma.HarvestRecordGetPayload<{
    include: {
      weather: true;
    };
  }> | null;
  weatherOptions: Weather[];
  onClose: () => void;
}

export const HarvestRecordForm = ({
  modal,
  selectedHarvestRecord,
  weatherOptions,
  onClose,
}: Props) => {
  const [state, action, pending] = useActionState(
    selectedHarvestRecord ? updateHarvestRecord : addHarvestRecord,
    {
      error: null,
    }
  );

  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          {modal === "add" ? "Tambah Data Panen Baru" : "Edit Data Panen"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi hasil panen untuk menambahkan data baru"
            : "Perbarui informasi hasil panen sesuai kebutuhan"}
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input
          type="hidden"
          name="id"
          defaultValue={selectedHarvestRecord?.id}
        />
        <ErrorMessage message={state.error} />

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Tanggal Panen</h3>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tanggal Panen *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={formatDateForInput(
                selectedHarvestRecord?.date || new Date()
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
              required
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Cloud className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Kondisi Cuaca</h3>
          </div>

          <div>
            <label
              htmlFor="weatherId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cuaca
            </label>
            <select
              id="weatherId"
              name="weatherId"
              defaultValue={selectedHarvestRecord?.weatherId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
            >
              <option value="">Pilih kondisi cuaca</option>
              {weatherOptions.map((weather) => (
                <option key={weather.id} value={weather.id}>
                  {weather.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Wheat className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Hasil Panen</h3>
          </div>

          <div>
            <label
              htmlFor="harvestAmount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Jumlah Hasil Panen (kg) *
            </label>
            <input
              type="number"
              id="harvestAmount"
              name="harvestAmount"
              step="0.01"
              min="0"
              defaultValue={selectedHarvestRecord?.harvestAmount}
              placeholder="Masukkan jumlah hasil panen dalam kilogram"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
              required
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Biaya Produksi
            </h3>
          </div>

          <div>
            <label
              htmlFor="productionCost"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Biaya Produksi (Rp) *
            </label>
            <input
              type="number"
              id="productionCost"
              name="productionCost"
              step="0.01"
              min="0"
              defaultValue={selectedHarvestRecord?.productionCost}
              placeholder="Masukkan biaya produksi dalam rupiah"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-150"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            disabled={pending}
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </span>
            ) : modal === "add" ? (
              "Simpan"
            ) : (
              "Perbarui"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
