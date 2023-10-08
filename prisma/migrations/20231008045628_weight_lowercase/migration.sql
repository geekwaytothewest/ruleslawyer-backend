/*
  Warnings:

  - You are about to drop the column `Weight` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "Weight",
ADD COLUMN     "weight" DECIMAL(65,30);
