/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collection_organizationId_name_key" ON "Collection"("organizationId", "name");
