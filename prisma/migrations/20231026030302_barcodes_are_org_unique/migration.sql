/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,barcode]` on the table `Copy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,barcodeLabel]` on the table `Copy` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "organizationId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Copy_organizationId_barcode_key" ON "Copy"("organizationId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Copy_organizationId_barcodeLabel_key" ON "Copy"("organizationId", "barcodeLabel");

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
