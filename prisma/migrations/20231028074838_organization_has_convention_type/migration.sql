/*
  Warnings:

  - Added the required column `organizationId` to the `ConventionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConventionType" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ConventionType" ADD CONSTRAINT "ConventionType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
