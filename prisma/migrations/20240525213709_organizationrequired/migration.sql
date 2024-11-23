/*
  Warnings:

  - Made the column `collectionId` on table `Copy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_collectionId_fkey";

-- AlterTable
ALTER TABLE "Copy" ALTER COLUMN "collectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
