/*
  Warnings:

  - You are about to drop the column `name` on the `Attendee` table. All the data in the column will be lost.
  - Added the required column `badgeName` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalName` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" DROP COLUMN "name",
ADD COLUMN     "badgeName" TEXT NOT NULL,
ADD COLUMN     "legalName" TEXT NOT NULL;
