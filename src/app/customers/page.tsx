import { getAllCustomers } from "@/actions/customers";
import { CustomersList } from "./_components/list";

interface Props {
  searchParams: Promise<{
    limit?: string;
    skip?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    message?: string;
    alertType?: "success" | "error";
  }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const { skip, sortBy, sortOrder, limit, search, alertType, message } =
    await searchParams;

  const result = await getAllCustomers(
    limit || "10",
    skip || "0",
    sortBy,
    sortOrder,
    search
  );

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Customer Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Kelola data pelanggan di sini
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <CustomersList
            customers={result.customers}
            pagination={{
              currentPage: result.currentPage,
              totalPages: result.totalPages,
              totalItems: result.totalCount,
              itemsPerPage: result.itemsPerPage,
              preserveParams: {
                limit,
                skip,
                sortBy,
                sortOrder,
                search,
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
