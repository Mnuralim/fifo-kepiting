import { performMultipleRegression } from "@/actions/test";
import { TestingList } from "./_components/list";

interface Props {
  searchParams: Promise<{
    sortBy?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: string;
  }>;
}

export default async function TestPage({ searchParams }: Props) {
  const { endDate, sortBy, sortOrder, startDate } = await searchParams;
  const result = await performMultipleRegression(
    sortBy,
    startDate,
    endDate,
    sortOrder
  );

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Test Multiple Regression
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Hasil pengujian regresi berganda dengan data yang diberikan.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <TestingList result={result} />
        </div>
      </div>
    </main>
  );
}
