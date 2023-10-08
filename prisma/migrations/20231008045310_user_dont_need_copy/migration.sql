/*
  Warnings:

  - You are about to drop the column `userId` on the `Copy` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_userId_fkey";

-- AlterTable
ALTER TABLE "Copy" DROP COLUMN "userId";
