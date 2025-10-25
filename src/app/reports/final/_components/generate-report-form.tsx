// "use client";

// import React, { useActionState } from "react";
// import { generateFinalReport } from "@/actions/reports";
// import { useRouter } from "next/navigation";

// interface Props {
//   onClose: () => void;
// }

// export const GenerateReportForm = ({ onClose }: Props) => {
//   const router = useRouter();
//   const [state, formAction, isPending] = useActionState(
//     async (prevState, formData: FormData) => {
//       const period = formData.get("period") as string;
//       const periodType = formData.get("periodType") as "month" | "year";

//       const result = await generateFinalReport(period, periodType);

//       if (result.success) {
//         router.refresh();
//         onClose();
//       }

//       return result;
//     },
//     { success: false }
//   );

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold text-slate-900 mb-4">
//         Generate Laporan Final
//       </h2>
//       <p className="text-sm text-slate-600 mb-6">
//         Pilih periode untuk generate laporan
//       </p>

//       <form action={formAction} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-2">
//             Tipe Periode
//           </label>
//           <select
//             name="periodType"
//             required
//             className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             defaultValue="month"
//           >
//             <option value="month">Bulanan</option>
//             <option value="year">Tahunan</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-2">
//             Periode
//           </label>
//           <input
//             type="month"
//             name="period"
//             required
//             className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <p className="text-xs text-slate-500 mt-1">
//             Format: YYYY-MM untuk bulanan, YYYY untuk tahunan
//           </p>
//         </div>

//         {state.error && (
//           <div className="bg-red-50 border border-red-200 rounded-md p-3">
//             <p className="text-sm text-red-600">{state.error}</p>
//           </div>
//         )}

//         <div className="flex gap-3 pt-4">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
//             disabled={isPending}
//           >
//             Batal
//           </button>
//           <button
//             type="submit"
//             className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
//             disabled={isPending}
//           >
//             {isPending ? "Generating..." : "Generate"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };
