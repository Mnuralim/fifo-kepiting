"use client";

import { Tabel, type TabelColumn } from "@/app/_components/tabel";
import { formatDate } from "@/lib/utils";
import type { RegressionOutput, RegressionResult } from "@/actions/test";

interface Props {
  result: RegressionResult;
}

export const TestingList = ({ result }: Props) => {
  const columns: TabelColumn<RegressionOutput>[] = [
    {
      header: "No",
      accessor: "date",
      render: (_, index) => (
        <span className="text-slate-500 font-medium">
          {(index as number) + 1}
        </span>
      ),
    },
    {
      header: "Tanggal",
      accessor: (item) => formatDate(new Date(item.date)) || "-",
      className: "font-mono text-sm",
    },
    {
      header: "X1",
      accessor: (item) => item.weatherValue || "-",
    },
    {
      header: "X2",
      accessor: (item) => item.cost || "-",
    },
    {
      header: "Y Aktual",
      accessor: (item) => item.actualHarvestAmount || "-",
    },
    {
      header: "Y Prediksi",
      accessor: (item) => item.predict || "-",
    },
    {
      header: "Error",
      accessor: (item) => item.error || "-",
    },
    {
      header: "Abs Error",
      accessor: (item) => item.absError || "-",
    },
    {
      header: "Error Squared",
      accessor: (item) => item.errorSquared || "-",
    },
    {
      header: "PE",
      accessor: (item) => `${item.pe}%` || "-",
    },
  ];

  return (
    <div className="w-full space-y-6">
      <Tabel columns={columns} data={result.data} />
      <div className="w-full overflow-hidden bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            Ringkasan Hasil
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  Total Data Points:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {result.totalDataPoints}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  RMSE:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {result.rmse.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  MAPE:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {result.mape.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  Model Digunakan:
                </span>
                <span className="text-sm text-slate-900 font-semibold">
                  {result.modelUsed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
