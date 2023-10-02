/*
  Warnings:

  - You are about to drop the column `userId` on the `CheckOut` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CheckOut" DROP CONSTRAINT "CheckOut_userId_fkey";

-- AlterTable
ALTER TABLE "CheckOut" DROP COLUMN "userId";
