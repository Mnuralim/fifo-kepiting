import { getAllSales } from "@/actions/sales";
import { SalesList } from "./_components/list";
import { getAllCrabs } from "@/actions/crabs";
import { getAllCustomers } from "@/actions/customers";

interface Props {
  searchParams: Promise<{
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    saleStatus?: string;
    message?: string;
    alertType?: "success" | "error";
  }>;
}

export default async function SalesPage({ searchParams }: Props) {
  const {
    skip,
    sortBy,
    sortOrder,
    limit,
    customerId,
    startDate,
    endDate,
    saleStatus,
    alertType,
    message,
  } = await searchParams;

  const [salesResult, crabsResult, customersResult] = await Promise.all([
    getAllSales(
      limit || "10",
      skip || "0",
      sortBy,
      sortOrder,
      customerId,
      startDate,
      endDate,
      saleStatus
    ),
    getAllCrabs("100000", "0", "crabName", "asc"),
    getAllCustomers("100000", "0", "customerName", "asc"),
  ]);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Sales Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Kelola transaksi penjualan dengan perhitungan FIFO otomatis
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SalesList
            sales={salesResult.sales}
            crabs={crabsResult.crabs}
            customers={customersResult.customers}
            pagination={{
              currentPage: salesResult.currentPage,
              totalPages: salesResult.totalPages,
              totalItems: salesResult.totalCount,
              itemsPerPage: salesResult.itemsPerPage,
              preserveParams: {
                limit,
                skip,
                sortBy,
                sortOrder,
                customerId,
                startDate,
                endDate,
                saleStatus,
                message,
                alertType,
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
