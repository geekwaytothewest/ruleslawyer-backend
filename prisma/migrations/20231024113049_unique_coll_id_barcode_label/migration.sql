/*
  Warnings:

  - A unique constraint covering the columns `[collectionId,barcodeLabel]` on the table `Copy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Copy_collectionId_barcodeLabel_key" ON "Copy"("collectionId", "barcodeLabel");
