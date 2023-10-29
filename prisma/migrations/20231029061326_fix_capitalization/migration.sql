/*
  Warnings:

  - You are about to drop the column `checkoutId` on the `Player` table. All the data in the column will be lost.
  - Added the required column `checkOutId` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_checkoutId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "checkoutId",
ADD COLUMN     "checkOutId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_checkOutId_fkey" FOREIGN KEY ("checkOutId") REFERENCES "CheckOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
