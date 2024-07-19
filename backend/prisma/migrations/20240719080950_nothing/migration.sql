/*
  Warnings:

  - You are about to drop the `pdf` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pdf` DROP FOREIGN KEY `PDF_doctorId_fkey`;

-- AlterTable
ALTER TABLE `patient` ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `pdf`;

-- CreateTable
CREATE TABLE `Upload` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `doctorId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Patient_email_key` ON `Patient`(`email`);

-- AddForeignKey
ALTER TABLE `Upload` ADD CONSTRAINT `Upload_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
