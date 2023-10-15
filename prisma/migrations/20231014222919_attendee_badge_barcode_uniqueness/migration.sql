/*
  Warnings:

  - A unique constraint covering the columns `[conventionId,badgeNumber]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conventionId,barcode]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_conventionId_badgeNumber_key" ON "Attendee"("conventionId", "badgeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Attendee_conventionId_barcode_key" ON "Attendee"("conventionId", "barcode");
