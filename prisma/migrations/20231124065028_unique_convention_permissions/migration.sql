/*
  Warnings:

  - A unique constraint covering the columns `[userId,conventionId]` on the table `UserConventionPermissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserConventionPermissions_userId_conventionId_key" ON "UserConventionPermissions"("userId", "conventionId");
