/*
  Warnings:

  - You are about to drop the column `tteApiKeyId` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `tteApiPrivateKey` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `tteApiPublicKey` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "tteApiKeyId",
DROP COLUMN "tteApiPrivateKey",
DROP COLUMN "tteApiPublicKey";
