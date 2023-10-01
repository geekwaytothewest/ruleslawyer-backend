/*
  Warnings:

  - You are about to drop the column `playAndWinSelected` on the `Convention` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Convention" DROP COLUMN "playAndWinSelected",
ADD COLUMN     "playAndWinWinnersAnnounced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playAndWinWinnersSelected" BOOLEAN NOT NULL DEFAULT false;
