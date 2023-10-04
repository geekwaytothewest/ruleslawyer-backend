/*
  Warnings:

  - Added the required column `coverArtOverride` to the `Copy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateAdded` to the `Copy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateRetired` to the `Copy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Weight` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artist` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverArt` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designer` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastBGGSync` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longDescription` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTime` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAge` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minTime` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publisher` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "coverArtOverride" BYTEA NOT NULL,
ADD COLUMN     "dateAdded" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateRetired" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "Weight" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "artist" TEXT NOT NULL,
ADD COLUMN     "coverArt" BYTEA NOT NULL,
ADD COLUMN     "designer" TEXT NOT NULL,
ADD COLUMN     "lastBGGSync" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "longDescription" TEXT NOT NULL,
ADD COLUMN     "maxTime" INTEGER NOT NULL,
ADD COLUMN     "minAge" INTEGER NOT NULL,
ADD COLUMN     "minTime" INTEGER NOT NULL,
ADD COLUMN     "publisher" TEXT NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL;
