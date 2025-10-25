"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { FileText, Calendar, Plus, Eye, Download } from "lucide-react";
import { Modal } from "@/app/_components/modal";
// import { GenerateReportForm } from "./generate-report-form";
import { ViewReportDetail } from "./view-report-detail";
import type { FinalReport } from "@prisma/client";

interface Props {
  reports: FinalReport[];
}

export const FinalReportsList = ({ reports }: Props) => {
  // const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinalReport>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleViewReport = (report: FinalReport) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Daftar Laporan ({reports.length})
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Generate dan simpan laporan periodik
          </p>
        </div>
        <button
          // onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Laporan
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">Belum ada laporan yang disimpan</p>
          <button
            // onClick={() => setIsGenerateModalOpen(true)}
            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Generate laporan pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {report.period}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.startDate).toLocaleDateString(
                        "id-ID"
                      )} -{" "}
                      {new Date(report.endDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Penjualan</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formatCurrency(report.totalSales)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">HPP</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(report.totalCOGS)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-900">
                    Laba Kotor
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(report.totalGrossProfit)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-xs text-slate-600">Transaksi</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {report.transactionCount}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600">Stok Out</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {report.totalStockOut} Kg
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewReport(report)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Lihat
                </button>
                <button className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      >
        <GenerateReportForm onClose={() => setIsGenerateModalOpen(false)} />
      </Modal> */}

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <ViewReportDetail
          report={selectedReport}
          onClose={() => setIsViewModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
