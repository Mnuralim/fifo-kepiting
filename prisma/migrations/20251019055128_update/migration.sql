/*
  Warnings:

  - You are about to alter the column `sellingPrice` on the `crab` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalSales` on the `final_reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalCOGS` on the `final_reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalGrossProfit` on the `final_reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalStockIn` on the `final_reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalStockOut` on the `final_reports` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantity` on the `sale_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `unitPrice` on the `sale_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `subtotal` on the `sale_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalCOGS` on the `sale_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `grossProfit` on the `sale_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalPrice` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalCOGS` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `grossProfit` on the `sales` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `quantityOut` on the `stock_out_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `unitPurchasePrice` on the `stock_out_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalPurchaseCost` on the `stock_out_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `entryQuantity` on the `stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `remainingStock` on the `stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `purchasePrice` on the `stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.
  - You are about to alter the column `totalCost` on the `stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Double`.

*/
-- AlterTable
ALTER TABLE `crab` MODIFY `sellingPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `final_reports` MODIFY `totalSales` DOUBLE NOT NULL,
    MODIFY `totalCOGS` DOUBLE NOT NULL,
    MODIFY `totalGrossProfit` DOUBLE NOT NULL,
    MODIFY `totalStockIn` DOUBLE NOT NULL,
    MODIFY `totalStockOut` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `sale_details` MODIFY `quantity` DOUBLE NOT NULL,
    MODIFY `unitPrice` DOUBLE NOT NULL,
    MODIFY `subtotal` DOUBLE NOT NULL,
    MODIFY `totalCOGS` DOUBLE NOT NULL,
    MODIFY `grossProfit` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `sales` MODIFY `totalPrice` DOUBLE NOT NULL,
    MODIFY `totalCOGS` DOUBLE NOT NULL,
    MODIFY `grossProfit` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `stock_out_details` MODIFY `quantityOut` DOUBLE NOT NULL,
    MODIFY `unitPurchasePrice` DOUBLE NOT NULL,
    MODIFY `totalPurchaseCost` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `stocks` MODIFY `entryQuantity` DOUBLE NOT NULL,
    MODIFY `remainingStock` DOUBLE NOT NULL,
    MODIFY `purchasePrice` DOUBLE NOT NULL,
    MODIFY `totalCost` DOUBLE NOT NULL;
