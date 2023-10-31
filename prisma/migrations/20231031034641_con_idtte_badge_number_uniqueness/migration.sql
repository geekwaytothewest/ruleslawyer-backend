/*
  Warnings:

  - A unique constraint covering the columns `[conventionId,tteBadgeNumber]` on the table `Attendee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendee_conventionId_tteBadgeNumber_key" ON "Attendee"("conventionId", "tteBadgeNumber");
