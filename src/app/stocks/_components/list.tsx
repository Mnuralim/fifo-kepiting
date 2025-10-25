"use client";

import { Edit, Plus, Trash2, Package } from "lucide-react";
import React, { useState } from "react";
import type { Stock, Crab, User } from "@prisma/client";
import { Tabel, type TabelColumn } from "@/app/_components/tabel";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pagination } from "@/app/_components/pagination";
import { Modal } from "@/app/_components/modal";
import { StockForm } from "./form";
import { Alert } from "@/app/_components/alert";
import { useRouter } from "next/navigation";
import { deleteStock } from "@/actions/stocks";

type StockWithRelations = Stock & {
  crab: Crab;
  user: Pick<User, "id" | "name" | "username">;
};

interface Props {
  pagination: PaginationProps;
  stocks: StockWithRelations[];
  crabs: Crab[];
}

export const StocksList = ({ pagination, stocks, crabs }: Props) => {
  const [selectedStock, setSelectedStock] = useState<StockWithRelations | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handelOpenModal = (item?: StockWithRelations) => {
    if (item) {
      setSelectedStock(item);
      setIsModalOpen(true);
    } else {
      setSelectedStock(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  const handleCloseAlert = () => {
    router.replace("/stocks", { scroll: false });
  };

  const columns: TabelColumn<StockWithRelations>[] = [
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
      header: "Kode Stok",
      accessor: "stockCode",
      className: "font-mono text-sm",
    },
    {
      header: "Nama Kepiting",
      accessor: (item) => item.crab.crabName,
    },
    {
      header: "Tanggal Masuk",
      accessor: (item) => formatDate(item.entryDate),
    },
    {
      header: "Jumlah Masuk",
      accessor: (item) => `${item.entryQuantity} ${item.crab.unit}`,
    },
    {
      header: "Sisa Stok",
      accessor: (item) => `${item.remainingStock} ${item.crab.unit}`,
      render: (item) => {
        const percentage = (item.remainingStock / item.entryQuantity) * 100;
        let colorClass = "text-green-600";
        if (percentage < 30) colorClass = "text-red-600";
        else if (percentage < 60) colorClass = "text-yellow-600";

        return (
          <span className={`font-semibold ${colorClass}`}>
            {item.remainingStock} {item.crab.unit}
          </span>
        );
      },
    },
    {
      header: "Harga Beli",
      accessor: (item) => formatCurrency(item.purchasePrice),
    },
    {
      header: "Total Biaya",
      accessor: (item) => formatCurrency(item.totalCost),
    },
    {
      header: "Status",
      accessor: "stockStatus",
      render: (item) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            item.stockStatus === "AVAILABLE"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.stockStatus === "AVAILABLE" ? "Tersedia" : "Habis"}
        </span>
      ),
    },
    {
      header: "Aksi",
      accessor: (item) => item.id,
      className: "w-32",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handelOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteStock(item.id)} className="inline-block">
            <button
              type="submit"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
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
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => handelOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Stok Baru
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Package className="w-4 h-4" />
          <span>Total Data: {pagination.totalItems}</span>
        </div>
      </div>

      <Tabel columns={columns} data={stocks} />

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
        <StockForm
          crabs={crabs}
          modal={selectedStock ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedStock={selectedStock}
        />
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
