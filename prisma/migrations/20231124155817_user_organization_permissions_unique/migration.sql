/*
  Warnings:

  - A unique constraint covering the columns `[userId,organizationId]` on the table `UserOrganizationPermissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserOrganizationPermissions_userId_organizationId_key" ON "UserOrganizationPermissions"("userId", "organizationId");
