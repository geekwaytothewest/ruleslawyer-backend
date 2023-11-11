/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `Convention` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `ConventionType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Convention_name_organizationId_key" ON "Convention"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConventionType_name_organizationId_key" ON "ConventionType"("name", "organizationId");
