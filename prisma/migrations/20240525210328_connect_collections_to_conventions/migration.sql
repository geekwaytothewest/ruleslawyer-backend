/*
  Warnings:

  - You are about to drop the column `doorPrizeCollectionId` on the `Convention` table. All the data in the column will be lost.
  - You are about to drop the column `doorPrizesAnnounced` on the `Convention` table. All the data in the column will be lost.
  - You are about to drop the column `playAndWinAnnounced` on the `Convention` table. All the data in the column will be lost.
  - You are about to drop the column `playAndWinCollectionId` on the `Convention` table. All the data in the column will be lost.
  - You are about to drop the column `playAndWinWinnersAnnounced` on the `Convention` table. All the data in the column will be lost.
  - You are about to drop the column `playAndWinWinnersSelected` on the `Convention` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Convention" DROP CONSTRAINT "Convention_doorPrizeCollectionId_fkey";

-- DropForeignKey
ALTER TABLE "Convention" DROP CONSTRAINT "Convention_playAndWinCollectionId_fkey";

-- DropIndex
DROP INDEX "Convention_doorPrizeCollectionId_key";

-- DropIndex
DROP INDEX "Convention_playAndWinCollectionId_key";

-- AlterTable
ALTER TABLE "Convention" DROP COLUMN "doorPrizeCollectionId",
DROP COLUMN "doorPrizesAnnounced",
DROP COLUMN "playAndWinAnnounced",
DROP COLUMN "playAndWinCollectionId",
DROP COLUMN "playAndWinWinnersAnnounced",
DROP COLUMN "playAndWinWinnersSelected";

-- CreateTable
CREATE TABLE "ConventionCollections" (
    "id" SERIAL NOT NULL,
    "conventionId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,

    CONSTRAINT "ConventionCollections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConventionCollections_conventionId_collectionId_key" ON "ConventionCollections"("conventionId", "collectionId");

-- AddForeignKey
ALTER TABLE "ConventionCollections" ADD CONSTRAINT "ConventionCollections_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "Convention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConventionCollections" ADD CONSTRAINT "ConventionCollections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
