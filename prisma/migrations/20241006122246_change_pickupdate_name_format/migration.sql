/*
  Warnings:

  - You are about to drop the column `pickup_date` on the `request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `request` DROP COLUMN `pickup_date`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `pickupDate` VARCHAR(191) NULL;
