/*
  Warnings:

  - A unique constraint covering the columns `[bggId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Game_bggId_key" ON "Game"("bggId");
