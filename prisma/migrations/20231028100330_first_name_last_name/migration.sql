/*
  Warnings:

  - Added the required column `badgeFirstName` to the `Attendee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badgeLastName` to the `Attendee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendee" ADD COLUMN     "badgeFirstName" TEXT NOT NULL,
ADD COLUMN     "badgeLastName" TEXT NOT NULL;
