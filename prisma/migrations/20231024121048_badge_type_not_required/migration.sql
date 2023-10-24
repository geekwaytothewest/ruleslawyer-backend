-- DropForeignKey
ALTER TABLE "Attendee" DROP CONSTRAINT "Attendee_badgeTypeId_fkey";

-- AlterTable
ALTER TABLE "Attendee" ALTER COLUMN "badgeTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendee" ADD CONSTRAINT "Attendee_badgeTypeId_fkey" FOREIGN KEY ("badgeTypeId") REFERENCES "BadgeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
