/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Game_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Game_organizationId_name_key" ON "Game"("organizationId", "name");
