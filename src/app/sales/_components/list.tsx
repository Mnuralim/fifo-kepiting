"use client";

import { Plus, Trash2, ShoppingCart, XCircle, Eye } from "lucide-react";
import React, { useState } from "react";
import type { Sale, SaleDetail, Crab, Customer, User } from "@prisma/client";
import { Tabel, type TabelColumn } from "@/app/_components/tabel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pagination } from "@/app/_components/pagination";
import { Modal } from "@/app/_components/modal";
import { SaleForm } from "./form";
import { Alert } from "@/app/_components/alert";
import { useRouter } from "next/navigation";
import { deleteSale, cancelSale } from "@/actions/sales";
import { SaleDetailModal } from "./detail";

type SaleWithRelations = Sale & {
  customer: Customer | null;
  user: Pick<User, "id" | "name" | "username">;
  saleDetails: (SaleDetail & {
    crab: Crab;
  })[];
};

interface Props {
  pagination: PaginationProps;
  sales: SaleWithRelations[];
  crabs: Crab[];
  customers: Customer[];
}

export const SalesList = ({ pagination, sales, crabs, customers }: Props) => {
  const [selectedSale, setSelectedSale] = useState<SaleWithRelations | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const router = useRouter();

  const handelOpenModal = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  const handleOpenDetailModal = (sale: SaleWithRelations) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSale(null);
  };

  const handleCloseAlert = () => {
    router.replace("/sales", { scroll: false });
  };

  const handleCancelSale = async (id: string) => {
    if (
      confirm(
        "Apakah Anda yakin ingin membatalkan transaksi ini? Stok akan dikembalikan."
      )
    ) {
      await cancelSale(id);
    }
  };

  const columns: TabelColumn<SaleWithRelations>[] = [
    {
      header: "No",
      accessor: "id",
      render: (_, index) => (
        <span className="text-slate-500 font-medium">
          {(index as number) + 1}
        </span>
      ),
    },
    {
      header: "No. Penjualan",
      accessor: "saleNumber",
      className: "font-mono text-sm",
    },
    {
      header: "Tanggal",
      accessor: (item) => formatDate(item.saleDate),
    },
    {
      header: "Pelanggan",
      accessor: (item) => item.customer?.customerName || item.buyerName || "-",
      render: (item) => (
        <div>
          <div className="font-medium">
            {item.customer?.customerName || item.buyerName || "Pembeli Umum"}
          </div>
          {item.customer && (
            <div className="text-xs text-slate-500">
              {item.customer.businessType}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Total Item",
      accessor: (item) => item.saleDetails.length,
      render: (item) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
          {item.saleDetails.length} Item
        </span>
      ),
    },
    {
      header: "Total Harga",
      accessor: (item) => formatCurrency(item.totalPrice),
      className: "font-semibold text-green-600",
    },
    {
      header: "HPP (FIFO)",
      accessor: (item) => formatCurrency(item.totalCOGS),
      className: "text-slate-600",
    },
    {
      header: "Laba Kotor",
      accessor: (item) => formatCurrency(item.grossProfit),
      render: (item) => {
        const profitMargin = (item.grossProfit / item.totalPrice) * 100;
        return (
          <div>
            <div className="font-semibold text-emerald-600">
              {formatCurrency(item.grossProfit)}
            </div>
            <div className="text-xs text-slate-500">
              Margin: {profitMargin.toFixed(1)}%
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "saleStatus",
      render: (item) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            item.saleStatus === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.saleStatus === "COMPLETED" ? "Selesai" : "Dibatalkan"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => item.id,
      className: "w-44",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenDetailModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors duration-150 border border-purple-200"
            title="Lihat Detail"
          >
            <Eye className="w-4 h-4" />
          </button>

          {item.saleStatus === "COMPLETED" && (
            <button
              onClick={() => handleCancelSale(item.id)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors duration-150 border border-orange-200"
              title="Batalkan Transaksi"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {item.saleStatus === "CANCELLED" && (
            <form action={() => deleteSale(item.id)} className="inline-block">
              <button
                type="submit"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 border border-red-200"
                title="Hapus Data"
                onClick={(e) => {
                  if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
                    e.preventDefault();
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={handelOpenModal}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Transaksi Baru
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <ShoppingCart className="w-4 h-4" />
          <span>Total Transaksi: {pagination.totalItems}</span>
        </div>
      </div>

      <Tabel columns={columns} data={sales} />

      <div className="mt-8">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          preserveParams={pagination.preserveParams}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <SaleForm
          crabs={crabs}
          customers={customers}
          onClose={handleCloseModal}
        />
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal}>
        <SaleDetailModal sale={selectedSale} onClose={handleCloseDetailModal} />
      </Modal>

      <Alert
        isVisible={pagination.preserveParams?.message !== undefined}
        message={(pagination.preserveParams?.message as string) || ""}
        onClose={handleCloseAlert}
        type={
          (pagination.preserveParams?.alertType as "success" | "error") ||
          "success"
        }
        autoClose
      />
    </div>
  );
};
