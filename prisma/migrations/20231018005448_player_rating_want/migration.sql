/*
  Warnings:

  - Added the required column `wantToWin` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "wantToWin" BOOLEAN NOT NULL;
