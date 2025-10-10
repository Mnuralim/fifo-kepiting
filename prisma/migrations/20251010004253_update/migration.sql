-- CreateTable
CREATE TABLE `admin` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_id_key`(`id`),
    UNIQUE INDEX `admin_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hasil_panen` (
    `id` VARCHAR(191) NOT NULL,
    `tanggal_panen` DATETIME(3) NOT NULL,
    `id_cuaca` VARCHAR(191) NULL,
    `hasil_panen` DOUBLE NOT NULL,
    `biaya_produksi` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `hasil_panen_id_key`(`id`),
    UNIQUE INDEX `hasil_panen_tanggal_panen_key`(`tanggal_panen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuaca` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `nilai` INTEGER NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `cuaca_id_key`(`id`),
    UNIQUE INDEX `cuaca_nama_key`(`nama`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `koefisien_regresi` (
    `id` VARCHAR(191) NOT NULL,
    `nama_model` VARCHAR(191) NOT NULL,
    `intercept` DOUBLE NOT NULL,
    `koefisien_cuaca` DOUBLE NOT NULL,
    `koefisien_biaya_produksi` DOUBLE NOT NULL,
    `mape` DOUBLE NULL,
    `pe` DOUBLE NULL,
    `r_squared` DOUBLE NULL,
    `rmse` DOUBLE NULL,
    `jumlah_data_latih` INTEGER NOT NULL,
    `waktu_latih` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `koefisien_regresi_id_key`(`id`),
    UNIQUE INDEX `koefisien_regresi_nama_model_key`(`nama_model`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_prediksi` (
    `id` VARCHAR(191) NOT NULL,
    `tanggal_panen` DATETIME(3) NOT NULL,
    `cuaca` VARCHAR(191) NOT NULL,
    `biaya_produksi` DOUBLE NOT NULL,
    `nilai_prediksi` DOUBLE NOT NULL,
    `model_yang_digunakan` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `log_prediksi_id_key`(`id`),
    UNIQUE INDEX `log_prediksi_tanggal_panen_key`(`tanggal_panen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hasil_panen` ADD CONSTRAINT `hasil_panen_id_cuaca_fkey` FOREIGN KEY (`id_cuaca`) REFERENCES `cuaca`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
