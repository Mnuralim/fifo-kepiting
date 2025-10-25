"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { X, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import type { FinalReport } from "@prisma/client";

interface Props {
  report?: FinalReport;
  onClose: () => void;
}

export const ViewReportDetail = ({ report, onClose }: Props) => {
  if (!report) return null;

  const profitMargin =
    report.totalSales > 0
      ? ((report.totalGrossProfit / report.totalSales) * 100).toFixed(2)
      : 0;

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Laporan Periode {report.period}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {new Date(report.startDate).toLocaleDateString("id-ID")} -{" "}
            {new Date(report.endDate).toLocaleDateString("id-ID")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Total Penjualan
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(report.totalSales)}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Total HPP</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(report.totalCOGS)}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Laba Kotor
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(report.totalGrossProfit)}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Profit Margin
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{profitMargin}%</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Detail Laporan</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-sm text-slate-600">Jumlah Transaksi</span>
            <span className="text-sm font-medium text-slate-900">
              {report.transactionCount} transaksi
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-sm text-slate-600">Total Stok Masuk</span>
            <span className="text-sm font-medium text-slate-900">
              {report.totalStockIn} Kg
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-sm text-slate-600">Total Stok Keluar</span>
            <span className="text-sm font-medium text-slate-900">
              {report.totalStockOut} Kg
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-sm text-slate-600">Sisa Stok</span>
            <span className="text-sm font-medium text-slate-900">
              {(report.totalStockIn - report.totalStockOut).toFixed(2)} Kg
            </span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-sm text-slate-600">Dibuat Pada</span>
            <span className="text-sm font-medium text-slate-900">
              {new Date(report.createdAt).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
        >
          Tutup
        </button>
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
          Export PDF
        </button>
      </div>
    </div>
  );
};
