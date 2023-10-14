/*
  Warnings:

  - You are about to drop the column `barcodeNumber` on the `Copy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[collectionId,barcode]` on the table `Copy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcodeLabel` to the `Copy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Copy" DROP COLUMN "barcodeNumber",
ADD COLUMN     "barcodeLabel" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Copy_collectionId_barcode_key" ON "Copy"("collectionId", "barcode");
