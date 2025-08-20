import { getAllWeathers } from "@/actions/harvests";
import { PredictForm } from "./predict/_components/form";
import Image from "next/image";

export default async function Home() {
  const weathers = await getAllWeathers();

  return (
    <div className="absolute left-0 top-0 w-full bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Image src={"/logo1.png"} width={80} height={80} alt={"logo"} />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Prediksi Hasil Panen
            <span className="block text-blue-600">Ikan Teri</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sistem prediksi cerdas untuk membantu nelayan memperkirakan hasil
            tangkapan ikan teri berdasarkan kondisi cuaca dan faktor lingkungan
            terkini.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Prediksi Akurat
            </h3>
            <p className="text-gray-600">
              Algoritma yang terus belajar dari data historis hasil tangkapan.
            </p>
          </div>

          {/* <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Data Cuaca Real-time
            </h3>
            <p className="text-gray-600">
              Integrasi dengan data cuaca terkini untuk prediksi yang lebih
              tepat.
            </p>
          </div> */}

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Hasil Instan
            </h3>
            <p className="text-gray-600">
              Dapatkan prediksi hasil panen dalam hitungan detik.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Mulai Prediksi
              </h2>
              <p className="text-blue-100">
                Masukkan data kondisi cuaca untuk mendapatkan prediksi hasil
                panen ikan teri
              </p>
            </div>

            <div className="p-8">
              <PredictForm weathers={weathers} />
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            💡 <strong>Tips:</strong> Hasil prediksi lebih akurat dengan data
            cuaca yang lengkap dan terkini
          </p>
        </div>
      </div>
    </div>
  );
}
