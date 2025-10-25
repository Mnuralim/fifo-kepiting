"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Award, Users } from "lucide-react";

// Type definitions based on getProfitLossReport return
interface CrabDetail {
  id: string;
  crabName: string;
  crabCode: string;
  unit: string;
}

interface TopProduct {
  crabId: string;
  _sum: {
    quantity: number | null;
    subtotal: number | null;
    grossProfit: number | null;
  };
  crab?: CrabDetail;
}

interface CustomerDetail {
  id: string;
  customerName: string;
  customerCode: string;
}

interface TopCustomer {
  customerId: string | null;
  _sum: {
    totalPrice: number | null;
    grossProfit: number | null;
  };
  _count: {
    id: number;
  };
  customer?: CustomerDetail;
}

interface ReportSummary {
  totalRevenue: number;
  totalCOGS: number;
  totalGrossProfit: number;
  transactionCount: number;
  profitMargin: number;
}

interface ProfitLossReport {
  summary: ReportSummary;
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
}

interface Props {
  report: ProfitLossReport;
  defaultStartDate: string;
  defaultEndDate: string;
}

export const ProfitLossReportView = ({
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

    router.push(`/reports/profit-loss?${newParams.toString()}`);
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">Pendapatan</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(report.summary.totalRevenue)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">HPP</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {formatCurrency(report.summary.totalCOGS)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">Laba Kotor</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatCurrency(report.summary.totalGrossProfit)}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium">Margin</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {report.summary.profitMargin.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">
            Top 10 Produk Terlaris
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Qty Terjual
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Total Penjualan
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Laba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.topProducts.map((product, index) => (
                <tr key={product.crabId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-bold text-slate-600">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {product.crab?.crabName || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {product._sum.quantity} {product.crab?.unit || "Kg"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(product._sum.subtotal || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                    {formatCurrency(product._sum.grossProfit || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Top 10 Customer</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Transaksi
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Total Belanja
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">
                  Kontribusi Laba
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.topCustomers.map((customer, index) => (
                <tr
                  key={customer.customerId || index}
                  className="hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-bold text-slate-600">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {customer.customer?.customerName || "Customer Umum"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    {customer._count.id} transaksi
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                    {formatCurrency(customer._sum.totalPrice || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                    {formatCurrency(customer._sum.grossProfit || 0)}
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
