"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Calendar,
  Download,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import type { Prisma } from "@prisma/client";

type SalesReport = Prisma.SaleGetPayload<{
  include: {
    customer: {
      select: {
        customerName: true;
        customerCode: true;
      };
    };
    saleDetails: {
      include: {
        crab: {
          select: {
            crabName: true;
            crabCode: true;
            unit: true;
          };
        };
      };
    };
    user: {
      select: {
        name: true;
      };
    };
  };
}>;

interface Props {
  report: {
    sales: SalesReport[];
    summary: {
      totalSales: number;
      totalCOGS: number;
      totalGrossProfit: number;
      transactionCount: number;
      profitMargin: number;
    };
  };
  defaultStartDate: string;
  defaultEndDate: string;
}

export const SalesReportView = ({
  report,
  defaultStartDate,
  defaultEndDate,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams(searchParams);

    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;

    if (startDate) newParams.set("startDate", startDate);
    if (endDate) newParams.set("endDate", endDate);

    router.push(`/reports/sales?${newParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleFilter}
        className="bg-slate-50 border border-slate-200 rounded-lg p-4"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={defaultStartDate}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={defaultEndDate}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Filter
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total Penjualan
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(report.summary.totalSales)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total HPP</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {formatCurrency(report.summary.totalCOGS)}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Laba Kotor</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatCurrency(report.summary.totalGrossProfit)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Margin</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {report.summary.profitMargin.toFixed(2)}%
              </p>
            </div>
            <div className="text-purple-600 text-lg font-bold">%</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">
            Transaksi ({report.summary.transactionCount})
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  No. Transaksi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  HPP
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Laba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.sales.map((sale, index: number) => (
                <tr key={sale.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {new Date(sale.saleDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900">
                    {sale.saleNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {sale.customer?.customerName || sale.buyerName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(sale.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">
                    {formatCurrency(sale.totalCOGS)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                    {formatCurrency(sale.grossProfit)}
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
