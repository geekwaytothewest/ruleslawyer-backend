/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `BadgeType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BadgeType_name_key" ON "BadgeType"("name");
