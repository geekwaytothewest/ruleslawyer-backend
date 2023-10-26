/*
  Warnings:

  - Made the column `organizationId` on table `Copy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_organizationId_fkey";

-- AlterTable
ALTER TABLE "Copy" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
