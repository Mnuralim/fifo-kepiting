"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Package, Layers, AlertCircle, DollarSign } from "lucide-react";
import type { Crab, StockStatus } from "@prisma/client";

// Type definitions based on getStockReport return
interface CrabDetail {
  crabName: string;
  crabCode: string;
  unit: string;
}

interface UserDetail {
  name: string;
}

interface StockWithRelations {
  id: string;
  stockCode: string;
  crabId: string;
  entryDate: Date;
  entryQuantity: number;
  remainingStock: number;
  purchasePrice: number;
  totalCost: number;
  supplier: string | null;
  notes: string | null;
  stockStatus: StockStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  crab: CrabDetail;
  user: UserDetail;
}

interface GroupedByCrab {
  crabName: string;
  crabCode: string;
  unit: string;
  totalEntryQuantity: number;
  totalRemainingStock: number;
  totalCost: number;
  batches: StockWithRelations[];
}

interface StockSummary {
  totalBatches: number;
  totalAvailableBatches: number;
  totalEmptyBatches: number;
  totalStockValue: number;
  totalRemainingStock: number;
}

interface StockReport {
  stocks: StockWithRelations[];
  groupedByCrab: GroupedByCrab[];
  summary: StockSummary;
}

interface Props {
  report: StockReport;
  crabs: Crab[];
}

export const StockReportView = ({ report, crabs }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);

    if (e.target.value) {
      newParams.set("crabId", e.target.value);
    } else {
      newParams.delete("crabId");
    }

    router.push(`/reports/stock?${newParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Filter Produk
            </label>
            <select
              onChange={handleFilter}
              defaultValue={searchParams.get("crabId") || ""}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Produk</option>
              {crabs.map((crab) => (
                <option key={crab.id} value={crab.id}>
                  {crab.crabName} ({crab.crabCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Batch</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {report.summary.totalBatches}
              </p>
            </div>
            <Layers className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">
                Batch Tersedia
              </p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {report.summary.totalAvailableBatches}
              </p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Stok</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {report.summary.totalRemainingStock} Kg
              </p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Nilai Stok</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {formatCurrency(report.summary.totalStockValue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Stok Per Produk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Total Batch
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Stok Masuk
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Stok Tersisa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Nilai Stok
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.groupedByCrab.map((group) => (
                <tr key={group.crabCode} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">
                        {group.crabName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {group.crabCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {group.batches.length} batch
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {group.totalEntryQuantity} {group.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`font-medium ${
                        group.totalRemainingStock < 10
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {group.totalRemainingStock} {group.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(group.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">
            Detail Batch Stok (FIFO)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Kode Stok
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Tgl Masuk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Supplier
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Qty Masuk
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Sisa
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Harga Beli
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">
                    {stock.stockCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {stock.crab.crabName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(stock.entryDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {stock.supplier || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {stock.entryQuantity} {stock.crab.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span
                      className={`font-medium ${
                        stock.remainingStock === 0
                          ? "text-slate-400"
                          : stock.remainingStock < 10
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {stock.remainingStock} {stock.crab.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {formatCurrency(stock.purchasePrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stock.stockStatus === "AVAILABLE" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Habis
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
