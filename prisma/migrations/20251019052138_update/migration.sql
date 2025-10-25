/*
  Warnings:

  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `final_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `fish` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sale_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stock_out_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `final_reports` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `fish` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `sale_details` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `stock_out_details` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customerId` on table `sales` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `sale_details` DROP FOREIGN KEY `sale_details_fishId_fkey`;

-- DropForeignKey
ALTER TABLE `sale_details` DROP FOREIGN KEY `sale_details_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `sales` DROP FOREIGN KEY `sales_userId_fkey`;

-- DropForeignKey
ALTER TABLE `stock_out_details` DROP FOREIGN KEY `stock_out_details_saleDetailId_fkey`;

-- DropForeignKey
ALTER TABLE `stock_out_details` DROP FOREIGN KEY `stock_out_details_stockId_fkey`;

-- DropForeignKey
ALTER TABLE `stocks` DROP FOREIGN KEY `stocks_fishId_fkey`;

-- DropForeignKey
ALTER TABLE `stocks` DROP FOREIGN KEY `stocks_userId_fkey`;

-- DropIndex
DROP INDEX `sale_details_fishId_fkey` ON `sale_details`;

-- DropIndex
DROP INDEX `sale_details_saleId_fkey` ON `sale_details`;

-- DropIndex
DROP INDEX `sales_customerId_fkey` ON `sales`;

-- DropIndex
DROP INDEX `sales_userId_fkey` ON `sales`;

-- DropIndex
DROP INDEX `stock_out_details_saleDetailId_fkey` ON `stock_out_details`;

-- DropIndex
DROP INDEX `stock_out_details_stockId_fkey` ON `stock_out_details`;

-- DropIndex
DROP INDEX `stocks_userId_fkey` ON `stocks`;

-- AlterTable
ALTER TABLE `customers` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `final_reports` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `fish` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sale_details` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `saleId` VARCHAR(191) NOT NULL,
    MODIFY `fishId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `sales` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `customerId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `stock_out_details` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `saleDetailId` VARCHAR(191) NOT NULL,
    MODIFY `stockId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `stocks` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `fishId` VARCHAR(191) NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE UNIQUE INDEX `customers_id_key` ON `customers`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `final_reports_id_key` ON `final_reports`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `fish_id_key` ON `fish`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `sale_details_id_key` ON `sale_details`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `sales_id_key` ON `sales`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `stock_out_details_id_key` ON `stock_out_details`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `stocks_id_key` ON `stocks`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_id_key` ON `users`(`id`);

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_fishId_fkey` FOREIGN KEY (`fishId`) REFERENCES `fish`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocks` ADD CONSTRAINT `stocks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sales` ADD CONSTRAINT `sales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
