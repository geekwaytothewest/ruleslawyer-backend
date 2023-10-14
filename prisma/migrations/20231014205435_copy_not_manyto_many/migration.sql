/*
  Warnings:

  - You are about to drop the `_CollectionToCopy` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CollectionToCopy" DROP CONSTRAINT "_CollectionToCopy_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionToCopy" DROP CONSTRAINT "_CollectionToCopy_B_fkey";

-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "collectionId" INTEGER;

-- DropTable
DROP TABLE "_CollectionToCopy";

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
