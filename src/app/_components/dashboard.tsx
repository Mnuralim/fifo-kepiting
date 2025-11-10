"use client";

import React from "react";
import {
  Package,
  Users,
  ShoppingCart,
  Database,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";

interface Props {
  totalCrabs: number;
  totalCustomers: number;
  totalSales: number;
  totalStocks: number;
  avgGrossProfit: number;
  totalRevenue: number;
  totalCOGS: number;
  totalGrossProfit: number;
  lowStockCount: number;
  recentSales: {
    id: string;
    saleNumber: string;
    saleDate: Date;
    totalPrice: number;
    grossProfit: number;
    customer: {
      customerName: string;
    } | null;
    buyerName: string | null;
  }[];
}

export const Dashboard = ({
  totalCrabs,
  totalCustomers,
  totalSales,
  totalStocks,
  avgGrossProfit,
  totalRevenue,
  totalCOGS,
  totalGrossProfit,
  lowStockCount,
  recentSales,
}: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const profitMargin =
    totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        </div>
        <p className="text-slate-600">
          Sistem Manajemen Kepiting dengan Metode FIFO (First In First Out)
        </p>
      </div>

      {/* Info Box FIFO */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Tentang Metode FIFO
            </h3>
            <p className="text-sm text-slate-700 mb-3">
              <strong>First In First Out (FIFO)</strong> adalah metode
              pengelolaan stok di mana stok yang masuk pertama akan
              keluar/dijual terlebih dahulu. Sistem ini memastikan perhitungan
              COGS (Cost of Goods Sold) yang akurat dan mencegah stok lama
              tertahan terlalu lama.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">
                  Keuntungan
                </p>
                <p className="text-xs text-slate-600">
                  Mencerminkan aliran fisik barang yang sebenarnya
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Akurat</p>
                <p className="text-xs text-slate-600">
                  Perhitungan COGS otomatis dari stok terlama
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">
                  Efisien
                </p>
                <p className="text-xs text-slate-600">
                  Mengurangi risiko stok expired atau rusak
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Jenis Kepiting
              </p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalCrabs}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Stok Tersedia
              </p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalStocks}
              </p>
              <p className="text-xs text-slate-500 mt-1">Batch FIFO</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Penjualan
              </p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalSales}
              </p>
              <p className="text-xs text-slate-500 mt-1">Transaksi FIFO</p>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pelanggan</p>
              <p className="text-2xl font-semibold text-slate-800">
                {totalCustomers}
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">Total Pendapatan</h3>
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-sm opacity-80">Dari {totalSales} transaksi</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">
              Total COGS (FIFO)
            </h3>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(totalCOGS)}</p>
          <p className="text-sm opacity-80">Dari stok terlama</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-sm font-medium opacity-90">Gross Profit</h3>
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(totalGrossProfit)}
          </p>
          <p className="text-sm opacity-80">Margin: {profitMargin}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Analisis FIFO
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm text-slate-700">Total Pendapatan</span>
              <span className="text-lg font-semibold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-slate-700">COGS (FIFO)</span>
              <span className="text-lg font-semibold text-red-600">
                - {formatCurrency(totalCOGS)}
              </span>
            </div>
            <div className="border-t-2 border-slate-300 pt-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-slate-800">
                  Gross Profit
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalGrossProfit)}
                </span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Rata-rata Profit per Transaksi
                </span>
                <span className="text-base font-semibold text-slate-700">
                  {formatCurrency(avgGrossProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Status Stok FIFO
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  totalStocks > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-slate-700">
                {totalStocks > 0
                  ? `${totalStocks} Batch Stok Tersedia`
                  : "Tidak Ada Stok Tersedia"}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  lowStockCount === 0 ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-sm text-slate-700">
                {lowStockCount === 0
                  ? "Semua Batch Stok Aman"
                  : `${lowStockCount} Batch Stok Menipis (< 10 Kg)`}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  totalSales > 0 ? "bg-green-500" : "bg-gray-500"
                }`}
              ></div>
              <span className="text-sm text-slate-700">
                {totalSales > 0
                  ? "Sistem FIFO Berjalan Normal"
                  : "Belum Ada Transaksi FIFO"}
              </span>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Info:</strong> Setiap penjualan otomatis menggunakan
                stok dengan tanggal masuk paling awal (FIFO) untuk menghitung
                COGS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-800">
              Penjualan Terbaru (FIFO)
            </h3>
          </div>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">
                        {sale.saleNumber}
                      </h4>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {formatCurrency(sale.grossProfit)} profit
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Pelanggan:</span>{" "}
                        {sale.customer?.customerName || sale.buyerName || "-"}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Total:</span>{" "}
                        {formatCurrency(sale.totalPrice)}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Tanggal:</span>{" "}
                        {formatDate(sale.saleDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-200 font-medium">
                        FIFO Applied
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium">Belum ada transaksi penjualan</p>
                <p className="text-sm mt-1">
                  Mulai input stok dan lakukan penjualan dengan metode FIFO
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-0">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/stocks?modal=add"
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group"
            >
              <Database className="w-6 h-6 text-slate-600 group-hover:text-green-600 mb-2 transition-colors" />
              <p className="text-sm font-medium text-slate-800">
                Input Stok FIFO
              </p>
            </Link>
            <Link
              href="/sales?modal=add"
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group"
            >
              <ShoppingCart className="w-6 h-6 text-slate-600 group-hover:text-blue-600 mb-2 transition-colors" />
              <p className="text-sm font-medium text-slate-800">
                Transaksi Penjualan
              </p>
            </Link>
            <Link
              href="/crabs"
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group"
            >
              <Package className="w-6 h-6 text-slate-600 group-hover:text-amber-600 mb-2 transition-colors" />
              <p className="text-sm font-medium text-slate-800">
                Kelola Produk
              </p>
            </Link>
            <Link
              href="/reports"
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 text-left group"
            >
              <TrendingUp className="w-6 h-6 text-slate-600 group-hover:text-violet-600 mb-2 transition-colors" />
              <p className="text-sm font-medium text-slate-800">Laporan FIFO</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
