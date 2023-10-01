/*
  Warnings:

  - Added the required column `userId` to the `UserConventionPermissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserOrganizationPermissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserConventionPermissions" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserOrganizationPermissions" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserOrganizationPermissions" ADD CONSTRAINT "UserOrganizationPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConventionPermissions" ADD CONSTRAINT "UserConventionPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
