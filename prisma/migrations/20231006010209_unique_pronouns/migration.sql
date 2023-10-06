/*
  Warnings:

  - A unique constraint covering the columns `[pronouns]` on the table `Pronouns` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pronouns_pronouns_key" ON "Pronouns"("pronouns");
