/*
  Warnings:

  - You are about to drop the column `tteApiKey` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "tteApiKey",
ADD COLUMN     "tteApiPrivateKey" TEXT,
ADD COLUMN     "tteApiPublicKey" TEXT;
