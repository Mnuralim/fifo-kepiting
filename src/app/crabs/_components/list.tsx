"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { Crab } from "@prisma/client";
import { Tabel, type TabelColumn } from "@/app/_components/tabel";
import { formatCurrency } from "@/lib/utils";
import { Pagination } from "@/app/_components/pagination";
import { Modal } from "@/app/_components/modal";
import { CrabForm } from "./form";
import { Alert } from "@/app/_components/alert";
import { useRouter } from "next/navigation";
import { deleteCrab } from "@/actions/crabs";

interface Props {
  pagination: PaginationProps;
  crabs: Crab[];
}

export const CrabsList = ({ pagination, crabs }: Props) => {
  const [selectedCrab, setSelectedCrab] = useState<Crab | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handelOpenModal = (item?: Crab) => {
    if (item) {
      setSelectedCrab(item);
      setIsModalOpen(true);
    } else {
      setSelectedCrab(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCrab(null);
  };

  const handleCloseAlert = () => {
    router.replace("/crabs", { scroll: false });
  };

  const columns: TabelColumn<Crab>[] = [
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
      header: "Kode Kepiting",
      accessor: "crabCode",
      className: "font-mono text-sm",
    },
    {
      header: "Nama Kepiting",
      accessor: "crabName",
    },
    {
      header: "Tipe",
      accessor: "crabType",
    },
    {
      header: "Harga Jual",
      accessor: (item) =>
        item.sellingPrice ? formatCurrency(item.sellingPrice) : "-",
    },
    {
      header: "Satuan",
      accessor: "unit",
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
          <form action={() => deleteCrab(item.id)} className="inline-block">
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
          Tambah Data
        </button>
      </div>

      <Tabel columns={columns} data={crabs} />

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
        <CrabForm
          modal={selectedCrab ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedCrab={selectedCrab}
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
