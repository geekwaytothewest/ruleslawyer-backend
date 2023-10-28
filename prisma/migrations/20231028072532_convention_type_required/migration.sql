/*
  Warnings:

  - Made the column `typeId` on table `Convention` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Convention" DROP CONSTRAINT "Convention_typeId_fkey";

-- AlterTable
ALTER TABLE "Convention" ALTER COLUMN "typeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConventionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
