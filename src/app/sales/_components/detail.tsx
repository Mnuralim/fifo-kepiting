"use client";

import {
  Receipt,
  Calendar,
  User,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
} from "lucide-react";
import type {
  Sale,
  SaleDetail,
  Crab,
  Customer,
  User as PrismaUser,
} from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";

type SaleWithRelations = Sale & {
  customer: Customer | null;
  user: Pick<PrismaUser, "id" | "name" | "username">;
  saleDetails: (SaleDetail & {
    crab: Crab;
  })[];
};

interface Props {
  sale: SaleWithRelations | null;
  onClose: () => void;
}

export const SaleDetailModal = ({ sale, onClose }: Props) => {
  if (!sale) return null;

  const profitMargin = (sale.grossProfit / sale.totalPrice) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-2">
          Detail Transaksi Penjualan
        </h2>
        <p className="text-sm text-gray-600">
          Informasi lengkap transaksi dengan perhitungan FIFO
        </p>
      </div>

      <div className="space-y-6">
        {/* Transaction Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Receipt className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Transaksi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nomor Penjualan
              </label>
              <p className="mt-1 text-sm font-mono font-semibold text-gray-900">
                {sale.saleNumber}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tanggal Transaksi
              </label>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(sale.saleDate)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </label>
              <p className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    sale.saleStatus === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {sale.saleStatus === "COMPLETED" ? "Selesai" : "Dibatalkan"}
                </span>
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Metode Pembayaran
              </label>
              <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                {sale.paymentMethod === "CASH" ? "Tunai" : "Transfer"}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Informasi Pelanggan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Nama Pelanggan
              </label>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {sale.customer?.customerName ||
                  sale.buyerName ||
                  "Pembeli Umum"}
              </p>
            </div>

            {sale.customer && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Jenis Bisnis
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {sale.customer.businessType}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    No. Telepon
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {sale.customer.phone || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Alamat
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {sale.customer.address || "-"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sale Items */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Item Penjualan
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    No
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Produk
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Jumlah
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Harga/Unit
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Subtotal
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    HPP (FIFO)
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Laba
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.saleDetails.map((detail, index) => {
                  const itemProfit = detail.grossProfit;
                  const itemMargin = (itemProfit / detail.subtotal) * 100;

                  return (
                    <tr key={detail.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {detail.crab.crabName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {detail.crab.crabType}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {detail.quantity} Kg
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(detail.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-green-600">
                        {formatCurrency(detail.subtotal)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(detail.totalCOGS)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div>
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency(itemProfit)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {itemMargin.toFixed(1)}%
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Ringkasan Keuangan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Penjualan
              </label>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(sale.totalPrice)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {sale.saleDetails.length} Item
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total HPP (FIFO)
              </label>
              <p className="mt-2 text-2xl font-bold text-orange-600">
                {formatCurrency(sale.totalCOGS)}
              </p>
              <p className="mt-1 text-xs text-gray-500">Metode FIFO</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Laba Kotor
                </label>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatCurrency(sale.grossProfit)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Margin: {profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Catatan:</strong> HPP (Harga Pokok Penjualan) dihitung
              menggunakan metode FIFO (First In First Out), mengambil stok dari
              batch terlama terlebih dahulu.
            </p>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Catatan</h3>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {sale.notes}
            </p>
          </div>
        )}

        {/* Admin Info */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            Dibuat oleh: <strong>{sale.user.name}</strong> ({sale.user.username}
            ) • {formatDate(sale.createdAt)}
          </p>
        </div>
      </div>

      {/* Close Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
