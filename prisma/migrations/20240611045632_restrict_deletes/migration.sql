-- DropForeignKey
ALTER TABLE "CheckOut" DROP CONSTRAINT "CheckOut_copyId_fkey";

-- DropForeignKey
ALTER TABLE "Copy" DROP CONSTRAINT "Copy_winnerId_fkey";

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "Copy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
