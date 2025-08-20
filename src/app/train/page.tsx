import { getCurrentModel } from "@/actions/train";
import { TrainModel } from "./_components/train";

interface Props {
  searchParams: Promise<{
    message?: string;
    error?: string;
    success?: string;
  }>;
}

export default async function TrainPage({ searchParams }: Props) {
  const { error, success, message } = await searchParams;
  const regressionCoefficients = await getCurrentModel();
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50">
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg">
        <div className="px-6 py-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Train Model
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Latih model regresi linear untuk memprediksi hasil panen
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <TrainModel
            regressionCoefficient={regressionCoefficients}
            alertType={error ? "error" : success ? "success" : undefined}
            message={message}
          />
        </div>
      </div>
    </main>
  );
}
