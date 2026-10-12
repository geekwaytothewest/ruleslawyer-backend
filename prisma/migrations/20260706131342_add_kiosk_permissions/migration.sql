-- AlterTable
ALTER TABLE "UserConventionPermissions" ADD COLUMN     "kiosk" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserOrganizationPermissions" ADD COLUMN     "kiosk" BOOLEAN NOT NULL DEFAULT false;
