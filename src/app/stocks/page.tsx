import { getAllStocks } from "@/actions/stocks";
import { StocksList } from "./_components/list";
import { getAllCrabs } from "@/actions/crabs";

interface Props {
  searchParams: Promise<{
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: string;
    crabId?: string;
    stockStatus?: string;
    message?: string;
    alertType?: "success" | "error";
  }>;
}

export default async function StocksPage({ searchParams }: Props) {
  const {
    skip,
    sortBy,
    sortOrder,
    limit,
    crabId,
    stockStatus,
    alertType,
    message,
  } = await searchParams;

  const [stockResult, crabResult] = await Promise.all([
    getAllStocks(
      limit || "10",
      skip || "0",
      sortBy,
      sortOrder,
      crabId,
      stockStatus
    ),
    getAllCrabs(limit || "100000", skip || "0", "name", sortOrder),
  ]);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Stock Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Kelola stok kepiting dengan metode FIFO di sini
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <StocksList
            crabs={crabResult.crabs}
            stocks={stockResult.stocks}
            pagination={{
              currentPage: stockResult.currentPage,
              totalPages: stockResult.totalPages,
              totalItems: stockResult.totalCount,
              itemsPerPage: stockResult.itemsPerPage,
              preserveParams: {
                limit,
                skip,
                sortBy,
                sortOrder,
                crabId,
                stockStatus,
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
