"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Package,
  RefreshCw,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const menuItems = [
  {
    title: "Laporan Penjualan",
    description: "Lihat detail transaksi penjualan per periode",
    icon: BarChart3,
    href: "/reports/sales",
    color: "blue",
  },
  {
    title: "Laporan Laba Rugi",
    description: "Analisis profit margin dan performa produk",
    icon: TrendingUp,
    href: "/reports/profit-loss",
    color: "green",
  },
  {
    title: "Laporan Stok",
    description: "Monitor stok tersedia dan nilai persediaan",
    icon: Package,
    href: "/reports/stock",
    color: "purple",
  },
  {
    title: "Pergerakan Stok",
    description: "Tracking stok masuk dan keluar (FIFO)",
    icon: RefreshCw,
    href: "/reports/stock-movement",
    color: "orange",
  },
  {
    title: "Laporan Final",
    description: "Laporan periodik yang sudah disimpan",
    icon: FileText,
    href: "/reports/final",
    color: "indigo",
  },
  {
    title: "Dashboard Statistik",
    description: "Overview performa bisnis real-time",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "cyan",
  },
];

const colorClasses = {
  blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
  green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
  purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
  orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100",
};

export const ReportsMenu = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`p-6 rounded-lg border-2 transition-all duration-200 ${
              colorClasses[item.color as keyof typeof colorClasses]
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
