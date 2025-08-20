-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_panen" (
    "id" TEXT NOT NULL,
    "tanggal_panen" TIMESTAMP(3) NOT NULL,
    "id_cuaca" TEXT,
    "hasil_panen" DOUBLE PRECISION NOT NULL,
    "biaya_produksi" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasil_panen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuaca" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuaca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "koefisien_regresi" (
    "id" TEXT NOT NULL,
    "nama_model" TEXT NOT NULL,
    "intercept" DOUBLE PRECISION NOT NULL,
    "koefisien_cuaca" DOUBLE PRECISION NOT NULL,
    "koefisien_biaya_produksi" DOUBLE PRECISION NOT NULL,
    "mape" DOUBLE PRECISION,
    "pe" DOUBLE PRECISION,
    "r_squared" DOUBLE PRECISION,
    "rmse" DOUBLE PRECISION,
    "jumlah_data_latih" INTEGER NOT NULL,
    "waktu_latih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "koefisien_regresi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_prediksi" (
    "id" TEXT NOT NULL,
    "tanggal_panen" TIMESTAMP(3) NOT NULL,
    "cuaca" TEXT NOT NULL,
    "biaya_produksi" DOUBLE PRECISION NOT NULL,
    "nilai_prediksi" DOUBLE PRECISION NOT NULL,
    "model_yang_digunakan" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_prediksi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_id_key" ON "admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_panen_id_key" ON "hasil_panen"("id");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_panen_tanggal_panen_key" ON "hasil_panen"("tanggal_panen");

-- CreateIndex
CREATE UNIQUE INDEX "cuaca_id_key" ON "cuaca"("id");

-- CreateIndex
CREATE UNIQUE INDEX "cuaca_nama_key" ON "cuaca"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "koefisien_regresi_id_key" ON "koefisien_regresi"("id");

-- CreateIndex
CREATE UNIQUE INDEX "koefisien_regresi_nama_model_key" ON "koefisien_regresi"("nama_model");

-- CreateIndex
CREATE UNIQUE INDEX "log_prediksi_id_key" ON "log_prediksi"("id");

-- CreateIndex
CREATE UNIQUE INDEX "log_prediksi_tanggal_panen_key" ON "log_prediksi"("tanggal_panen");

-- AddForeignKey
ALTER TABLE "hasil_panen" ADD CONSTRAINT "hasil_panen_id_cuaca_fkey" FOREIGN KEY ("id_cuaca") REFERENCES "cuaca"("id") ON DELETE SET NULL ON UPDATE CASCADE;
