/*
  Warnings:

  - Added the required column `attendeeId` to the `CheckOut` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CheckOut" DROP CONSTRAINT "CheckOut_userId_fkey";

-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_winnerId_fkey";

-- AlterTable
ALTER TABLE "CheckOut" ADD COLUMN     "attendeeId" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Copy" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "Attendee" (
    "id" SERIAL NOT NULL,
    "conventionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER,
    "badgeNumber" TEXT,
    "badgeTypeId" INTEGER,
    "tteBadgeNumber" INTEGER,
    "email" TEXT,
    "pronounsId" INTEGER,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "printed" BOOLEAN NOT NULL DEFAULT false,
    "registrationCode" TEXT,

    CONSTRAINT "Attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BadgeType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BadgeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pronouns" (
    "id" SERIAL NOT NULL,
    "pronouns" TEXT NOT NULL,

    CONSTRAINT "Pronouns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "Convention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_badgeTypeId_fkey" FOREIGN KEY ("badgeTypeId") REFERENCES "BadgeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_pronounsId_fkey" FOREIGN KEY ("pronounsId") REFERENCES "Pronouns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
