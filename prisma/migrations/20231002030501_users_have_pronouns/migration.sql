-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pronounsId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pronounsId_fkey" FOREIGN KEY ("pronounsId") REFERENCES "Pronouns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
