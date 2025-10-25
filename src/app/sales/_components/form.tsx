"use client";

import { useActionState, useState } from "react";
import {
  ShoppingCart,
  User,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Package,
} from "lucide-react";
import { ErrorMessage } from "@/app/_components/error-message";
import type { Crab, Customer } from "@prisma/client";
import { addSale } from "@/actions/sales";
import { formatCurrency } from "@/lib/utils";

interface SaleItem {
  crabId: string;
  crabName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Props {
  crabs: Crab[];
  customers: Customer[];
  onClose: () => void;
}

export const SaleForm = ({ crabs, customers, onClose }: Props) => {
  const [state, action, pending] = useActionState(addSale, {
    error: null,
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedCrabId, setSelectedCrabId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [showBuyerName, setShowBuyerName] = useState(false);

  const handleAddItem = () => {
    if (!selectedCrabId || !quantity || !unitPrice) {
      alert("Lengkapi data produk, jumlah, dan harga!");
      return;
    }

    const crab = crabs.find((c) => c.id === selectedCrabId);
    if (!crab) return;

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);

    if (qty <= 0 || price <= 0) {
      alert("Jumlah dan harga harus lebih dari 0!");
      return;
    }

    const newItem: SaleItem = {
      crabId: selectedCrabId,
      crabName: crab.crabName,
      quantity: qty,
      unitPrice: price,
      subtotal: qty * price,
    };

    setSaleItems([...saleItems, newItem]);
    setSelectedCrabId("");
    setQuantity("");
    setUnitPrice("");
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const handleCrabChange = (crabId: string) => {
    setSelectedCrabId(crabId);
    const crab = crabs.find((c) => c.id === crabId);
    if (crab) {
      setUnitPrice(crab.sellingPrice.toString());
    }
  };

  const totalPrice = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmit = (formData: FormData) => {
    if (saleItems.length === 0) {
      alert("Tambahkan minimal 1 produk!");
      return;
    }

    // Convert sale items to JSON
    const saleItemsData = saleItems.map((item) => ({
      crabId: item.crabId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    formData.append("saleItems", JSON.stringify(saleItemsData));
    action(formData);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          Transaksi Penjualan Baru
        </h2>
        <p className="text-sm text-gray-600">
          Buat transaksi penjualan dengan perhitungan HPP FIFO otomatis
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <ErrorMessage message={state.error} />

        {/* Sale Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <ShoppingCart className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Penjualan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="saleNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nomor Penjualan *
              </label>
              <input
                type="text"
                id="saleNumber"
                name="saleNumber"
                placeholder="Contoh: INV-001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="saleDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Penjualan *
              </label>
              <input
                type="date"
                id="saleDate"
                name="saleDate"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Pelanggan
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="customerType"
                  value="existing"
                  checked={!showBuyerName}
                  onChange={() => setShowBuyerName(false)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm">Pelanggan Terdaftar</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="customerType"
                  value="new"
                  checked={showBuyerName}
                  onChange={() => setShowBuyerName(true)}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm">Pembeli Umum</span>
              </label>
            </div>

            {!showBuyerName ? (
              <div>
                <label
                  htmlFor="customerId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Pilih Pelanggan
                </label>
                <select
                  id="customerId"
                  name="customerId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerName} - {customer.businessType}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="buyerName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Pembeli
                </label>
                <input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  placeholder="Masukkan nama pembeli"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Metode Pembayaran *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="CASH">Tunai</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Product Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Tambah Produk</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label
                htmlFor="crabSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Pilih Kepiting
              </label>
              <select
                id="crabSelect"
                value={selectedCrabId}
                onChange={(e) => handleCrabChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              >
                <option value="">-- Pilih Kepiting --</option>
                {crabs
                  .filter((crab) => crab.active)
                  .map((crab) => (
                    <option key={crab.id} value={crab.id}>
                      {crab.crabName} ({crab.crabType})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="quantityInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Jumlah (Kg)
              </label>
              <input
                type="number"
                id="quantityInput"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="unitPriceInput"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Harga/Kg (Rp)
              </label>
              <input
                type="number"
                id="unitPriceInput"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah ke Keranjang
          </button>
        </div>

        {/* Cart Items */}
        {saleItems.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Keranjang Belanja
              </h3>
              <span className="text-sm text-gray-500">
                {saleItems.length} Item
              </span>
            </div>

            <div className="space-y-3">
              {saleItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.crabName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.quantity} Kg × {formatCurrency(item.unitPrice)} ={" "}
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-gray-900">Total Penjualan:</span>
                <span className="text-blue-600">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * HPP akan dihitung otomatis menggunakan metode FIFO
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Catatan</h3>
          </div>

          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Catatan tambahan (opsional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={pending || saleItems.length === 0}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Proses Penjualan</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
