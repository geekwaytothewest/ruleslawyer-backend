/*
  Warnings:

  - Added the required column `barcodeNumber` to the `Copy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "barcodeNumber" INTEGER NOT NULL;
