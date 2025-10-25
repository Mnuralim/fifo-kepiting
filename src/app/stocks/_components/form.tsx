"use client";

import { useActionState } from "react";
import {
  Package,
  Tag,
  DollarSign,
  Calendar,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import { ErrorMessage } from "@/app/_components/error-message";
import type { Stock, Crab, User as PrismaUser } from "@prisma/client";
import { addStock, updateStock } from "@/actions/stocks";
import { formatCurrency } from "@/lib/utils";

type StockWithRelations = Stock & {
  crab: Crab;
  user: Pick<PrismaUser, "id" | "name" | "username">;
};

interface Props {
  modal?: "add" | "edit";
  selectedStock?: StockWithRelations | null;
  crabs: Crab[];
  onClose: () => void;
}

export const StockForm = ({ modal, selectedStock, onClose, crabs }: Props) => {
  const [state, action, pending] = useActionState(
    selectedStock ? updateStock : addStock,
    {
      error: null,
    }
  );

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value) || 0;
    const price =
      parseFloat(
        (document.getElementById("purchasePrice") as HTMLInputElement)?.value
      ) || 0;
    const totalCostInput = document.getElementById(
      "totalCost"
    ) as HTMLInputElement;
    if (totalCostInput) {
      totalCostInput.value = (quantity * price).toFixed(2);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value) || 0;
    const quantity =
      parseFloat(
        (document.getElementById("entryQuantity") as HTMLInputElement)?.value
      ) || 0;
    const totalCostInput = document.getElementById(
      "totalCost"
    ) as HTMLInputElement;
    if (totalCostInput) {
      totalCostInput.value = (quantity * price).toFixed(2);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          {modal === "add" ? "Tambah Stok Baru" : "Edit Data Stok"}
        </h2>
        <p className="text-sm text-gray-600">
          {modal === "add"
            ? "Lengkapi informasi stok masuk untuk menambahkan data baru (FIFO)"
            : "Perbarui informasi stok sesuai kebutuhan"}
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="id" defaultValue={selectedStock?.id} />
        <input type="hidden" name="userId" defaultValue="1" />{" "}
        <ErrorMessage message={state.error} />
        {modal === "add" && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Tag className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Kode Stok</h3>
            </div>

            <div>
              <label
                htmlFor="stockCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Kode Stok *
              </label>
              <input
                type="text"
                id="stockCode"
                name="stockCode"
                defaultValue={selectedStock?.stockCode || ""}
                placeholder="Contoh: STK001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Kode unik untuk identifikasi batch stok
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

          <div>
            <label
              htmlFor="crabId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Pilih Kepiting *
            </label>

            <select
              id="crabId"
              name="crabId"
              defaultValue={selectedStock?.crabId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
              required
              disabled={modal === "edit"}
            >
              <option value="">-- Pilih Kepiting --</option>
              {crabs.map((crab) => (
                <option key={crab.id} value={crab.id}>
                  {crab.crabName} ({crab.crabType}) -{" "}
                  {formatCurrency(crab.sellingPrice)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Tanggal & Jumlah
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="entryDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Masuk *
              </label>
              <input
                type="date"
                id="entryDate"
                name="entryDate"
                defaultValue={
                  selectedStock?.entryDate
                    ? new Date(selectedStock.entryDate)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="entryQuantity"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jumlah Masuk (Kg) *
              </label>
              <input
                type="number"
                id="entryQuantity"
                name="entryQuantity"
                step="0.01"
                min="0"
                defaultValue={selectedStock?.entryQuantity.toString() || ""}
                placeholder="Masukkan jumlah dalam Kg"
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Harga Beli</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="purchasePrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Harga Beli per Kg (Rp) *
              </label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                step="0.01"
                min="0"
                defaultValue={selectedStock?.purchasePrice.toString() || ""}
                placeholder="Masukkan harga beli per Kg"
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
                required
              />
            </div>

            <div>
              <label
                htmlFor="totalCost"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Total Biaya (Rp)
              </label>
              <input
                type="number"
                id="totalCost"
                name="totalCost"
                step="0.01"
                defaultValue={selectedStock?.totalCost.toString() || "0"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                Otomatis dihitung: Jumlah × Harga Beli
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Supplier</h3>
          </div>

          <div>
            <label
              htmlFor="supplier"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Supplier/Nelayan
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              defaultValue={selectedStock?.supplier || ""}
              placeholder="Contoh: Nelayan Watolo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-150"
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Catatan</h3>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Catatan
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={selectedStock?.notes || ""}
              placeholder="Masukkan catatan tambahan (opsional)"
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
