/*
  Warnings:

  - You are about to drop the column `fishId` on the `sale_details` table. All the data in the column will be lost.
  - You are about to drop the column `fishId` on the `stocks` table. All the data in the column will be lost.
  - You are about to drop the `fish` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `crabId` to the `sale_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `crabId` to the `stocks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `sale_details` DROP FOREIGN KEY `sale_details_fishId_fkey`;

-- DropForeignKey
ALTER TABLE `stocks` DROP FOREIGN KEY `stocks_fishId_fkey`;

-- DropIndex
DROP INDEX `sale_details_fishId_fkey` ON `sale_details`;

-- DropIndex
DROP INDEX `stocks_fishId_entryDate_stockStatus_idx` ON `stocks`;

-- AlterTable
ALTER TABLE `sale_details` DROP COLUMN `fishId`,
    ADD COLUMN `crabId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stocks` DROP COLUMN `fishId`,
    ADD COLUMN `crabId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `fish`;

-- CreateTable
CREATE TABLE `crab` (
    `id` VARCHAR(191) NOT NULL,
    `crabCode` VARCHAR(50) NOT NULL,
    `crabName` VARCHAR(150) NOT NULL,
    `crabType` VARCHAR(100) NOT NULL,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'Kg',
    `sellingPrice` DECIMAL(15, 2) NOT NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `crab_id_key`(`id`),
    UNIQUE INDEX `crab_crabCode_key`(`crabCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `stocks_crabId_entryDate_stockStatus_idx` ON `stocks`(`crabId`, `entryDate`, `stockStatus`);

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_crabId_fkey` FOREIGN KEY (`crabId`) REFERENCES `crab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_details` ADD CONSTRAINT `sale_details_crabId_fkey` FOREIGN KEY (`crabId`) REFERENCES `crab`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
