/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cuaca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hasil_panen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `koefisien_regresi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `log_prediksi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `hasil_panen` DROP FOREIGN KEY `hasil_panen_id_cuaca_fkey`;

-- DropTable
DROP TABLE `admin`;

-- DropTable
DROP TABLE `cuaca`;

-- DropTable
DROP TABLE `hasil_panen`;

-- DropTable
DROP TABLE `koefisien_regresi`;

-- DropTable
DROP TABLE `log_prediksi`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'OWNER') NOT NULL DEFAULT 'ADMIN',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fish` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fishCode` VARCHAR(50) NOT NULL,
    `fishName` VARCHAR(150) NOT NULL,
    `fishType` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'Kg',
    `sellingPrice` DECIMAL(15, 2) NOT NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fish_fishCode_key`(`fishCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockCode` VARCHAR(50) NOT NULL,
    `fishId` INTEGER NOT NULL,
    `entryDate` DATETIME(3) NOT NULL,
    `entryQuantity` DECIMAL(10, 2) NOT NULL,
    `remainingStock` DECIMAL(10, 2) NOT NULL,
    `purchasePrice` DECIMAL(15, 2) NOT NULL,
    `totalCost` DECIMAL(15, 2) NOT NULL,
    `supplier` VARCHAR(150) NULL,
    `notes` TEXT NULL,
    `stockStatus` ENUM('AVAILABLE', 'EMPTY') NOT NULL DEFAULT 'AVAILABLE',
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stocks_stockCode_key`(`stockCode`),
    INDEX `stocks_fishId_entryDate_stockStatus_idx`(`fishId`, `entryDate`, `stockStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerCode` VARCHAR(50) NOT NULL,
    `customerName` VARCHAR(150) NOT NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `businessType` VARCHAR(100) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_customerCode_key`(`customerCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleNumber` VARCHAR(50) NOT NULL,
    `saleDate` DATETIME(3) NOT NULL,
    `customerId` INTEGER NULL,
    `buyerName` VARCHAR(150) NULL,
    `totalPrice` DECIMAL(15, 2) NOT NULL,
    `totalCOGS` DECIMAL(15, 2) NOT NULL,
    `grossProfit` DECIMAL(15, 2) NOT NULL,
    `paymentMethod` VARCHAR(50) NOT NULL,
    `saleStatus` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `notes` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sales_saleNumber_key`(`saleNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `fishId` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitPrice` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `totalCOGS` DECIMAL(15, 2) NOT NULL,
    `grossProfit` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_out_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleDetailId` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `quantityOut` DECIMAL(10, 2) NOT NULL,
    `unitPurchasePrice` DECIMAL(15, 2) NOT NULL,
    `totalPurchaseCost` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `final_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `period` VARCHAR(50) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalSales` DECIMAL(15, 2) NOT NULL,
    `totalCOGS` DECIMAL(15, 2) NOT NULL,
    `totalGrossProfit` DECIMAL(15, 2) NOT NULL,
    `transactionCount` INTEGER NOT NULL,
    `totalStockIn` DECIMAL(15, 2) NOT NULL,
    `totalStockOut` DECIMAL(15, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `final_reports_period_key`(`period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_fishId_fkey` FOREIGN KEY (`fishId`) REFERENCES `fish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `sale_details_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `sale_details_fishId_fkey` FOREIGN KEY (`fishId`) REFERENCES `fish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_details` ADD CONSTRAINT `stock_out_details_saleDetailId_fkey` FOREIGN KEY (`saleDetailId`) REFERENCES `sale_details`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_out_details` ADD CONSTRAINT `stock_out_details_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
