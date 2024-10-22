/*
  Warnings:

  - You are about to drop the column `email` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_userId_fkey`;

-- AlterTable
ALTER TABLE `request` DROP COLUMN `email`,
    DROP COLUMN `userId`,
    ADD COLUMN `clientId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
