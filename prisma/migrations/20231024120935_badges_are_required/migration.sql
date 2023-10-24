/*
  Warnings:

  - Made the column `badgeNumber` on table `Attendee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `badgeTypeId` on table `Attendee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `barcode` on table `Attendee` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Attendee" DROP CONSTRAINT "Attendee_badgeTypeId_fkey";

-- AlterTable
ALTER TABLE "Attendee" ALTER COLUMN "badgeNumber" SET NOT NULL,
ALTER COLUMN "badgeTypeId" SET NOT NULL,
ALTER COLUMN "barcode" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_badgeTypeId_fkey" FOREIGN KEY ("badgeTypeId") REFERENCES "BadgeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
