"use client";

import { useActionState } from "react";
import { Package, Tag, DollarSign, FileText, Loader2 } from "lucide-react";
import { ErrorMessage } from "@/app/_components/error-message";
import type { Crab } from "@prisma/client";
import { addCrab, updateCrab } from "@/actions/crabs";

interface Props {
  modal?: "add" | "edit";
  selectedCrab?: Crab | null;
  onClose: () => void;
}

export const CrabForm = ({ modal, selectedCrab, onClose }: Props) => {
  const [state, action, pending] = useActionState(
    selectedCrab ? updateCrab : addCrab,
    {
      error: null,
    }
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          {modal === "add" ? "Tambah Data Kepiting Baru" : "Edit Data Kepiting"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi kepiting untuk menambahkan data baru"
            : "Perbarui informasi kepiting sesuai kebutuhan"}
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="id" defaultValue={selectedCrab?.id} />
        <ErrorMessage message={state.error} />

        {modal === "add" && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Tag className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Kode Kepiting
              </h3>
            </div>

            <div>
              <label
                htmlFor="crabCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kode Kepiting *
              </label>
              <input
                type="text"
                id="crabCode"
                name="crabCode"
                defaultValue={selectedCrab?.crabCode || ""}
                placeholder="Contoh: CRB001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Kode unik untuk identifikasi kepiting
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Kepiting
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="crabName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Kepiting *
              </label>
              <input
                type="text"
                id="crabName"
                name="crabName"
                defaultValue={selectedCrab?.crabName || ""}
                placeholder="Masukkan nama kepiting"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="crabType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipe Kepiting *
              </label>
              <input
                type="text"
                id="crabType"
                name="crabType"
                defaultValue={selectedCrab?.crabType || ""}
                placeholder="Contoh: Blue Swimming Crab, Mud Crab"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Harga Jual</h3>
          </div>

          <div>
            <label
              htmlFor="sellingPrice"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Harga Jual (Rp) *
            </label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              step="0.01"
              min="0"
              defaultValue={selectedCrab?.sellingPrice.toString() || ""}
              placeholder="Masukkan harga jual dalam rupiah"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
              required
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Deskripsi</h3>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={selectedCrab?.description || ""}
              placeholder="Masukkan deskripsi kepiting (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150 resize-none"
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
