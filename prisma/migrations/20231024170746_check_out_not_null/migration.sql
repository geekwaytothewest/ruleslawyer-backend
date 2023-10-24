/*
  Warnings:

  - Made the column `checkOut` on table `CheckOut` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CheckOut" ALTER COLUMN "checkOut" SET NOT NULL;
