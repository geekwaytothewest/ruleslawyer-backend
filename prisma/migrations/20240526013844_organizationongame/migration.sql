-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "organizationId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
