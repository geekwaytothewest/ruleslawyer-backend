/*
  Warnings:

  - Made the column `startDate` on table `Convention` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `Convention` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Convention" ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;
