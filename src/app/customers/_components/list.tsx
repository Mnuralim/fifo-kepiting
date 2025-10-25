"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { Customer } from "@prisma/client";
import { Tabel, type TabelColumn } from "@/app/_components/tabel";
import { Pagination } from "@/app/_components/pagination";
import { Modal } from "@/app/_components/modal";
import { CustomerForm } from "./form";
import { Alert } from "@/app/_components/alert";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/actions/customers";

interface Props {
  pagination: PaginationProps;
  customers: Customer[];
}

export const CustomersList = ({ pagination, customers }: Props) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOpenModal = (item?: Customer) => {
    if (item) {
      setSelectedCustomer(item);
      setIsModalOpen(true);
    } else {
      setSelectedCustomer(null);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCloseAlert = () => {
    router.replace("/customers", { scroll: false });
  };

  const columns: TabelColumn<Customer>[] = [
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
      header: "Kode Pelanggan",
      accessor: "customerCode",
      className: "font-mono text-sm",
    },
    {
      header: "Nama Pelanggan",
      accessor: "customerName",
    },
    {
      header: "Telepon",
      accessor: (item) => item.phone || "-",
    },
    {
      header: "Alamat",
      accessor: (item) => item.address || "-",
      className: "max-w-xs truncate",
    },
    {
      header: "Jenis Usaha",
      accessor: (item) => item.businessType || "-",
    },
    {
      header: "Aksi",
      accessor: (item) => item.id,
      className: "w-32",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(item)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
            title="Edit Data"
          >
            <Edit className="w-4 h-4" />
          </button>
          <form action={() => deleteCustomer(item.id)} className="inline-block">
            <button
              type="submit"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
              title="Hapus Data"
              onClick={(e) => {
                if (
                  !confirm(
                    "Apakah Anda yakin ingin menghapus data pelanggan ini?"
                  )
                ) {
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
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors duration-150 shadow-sm border border-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Data
        </button>
      </div>

      <Tabel columns={columns} data={customers} />

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
        <CustomerForm
          modal={selectedCustomer ? "edit" : "add"}
          onClose={handleCloseModal}
          selectedCustomer={selectedCustomer}
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
