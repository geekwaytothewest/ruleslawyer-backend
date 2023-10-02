-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_winnerId_fkey";

-- AlterTable
ALTER TABLE "Copy" ALTER COLUMN "winnable" SET DEFAULT true,
ALTER COLUMN "winnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Attendee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
