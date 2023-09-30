/*
  Warnings:

  - Added the required column `superAdmin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "superAdmin" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "UserOrganizationPermissions" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "geekGuide" BOOLEAN NOT NULL,
    "readOnly" BOOLEAN NOT NULL,

    CONSTRAINT "UserOrganizationPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConventionPermissions" (
    "id" SERIAL NOT NULL,
    "conventionId" INTEGER NOT NULL,
    "admin" BOOLEAN NOT NULL,
    "geekGuide" BOOLEAN NOT NULL,
    "attendee" BOOLEAN NOT NULL,

    CONSTRAINT "UserConventionPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConventionType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" BYTEA NOT NULL,
    "logoSquare" BYTEA NOT NULL,
    "icon" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "ConventionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationDate" (
    "id" SERIAL NOT NULL,
    "conventionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "bggId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Copy" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "winnable" BOOLEAN NOT NULL,
    "winnerId" INTEGER NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckOut" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "checkOut" TIMESTAMP(3),
    "checkIn" TIMESTAMP(3),
    "copyId" INTEGER,

    CONSTRAINT "CheckOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convention" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "logo" BYTEA NOT NULL,
    "logoSquare" BYTEA NOT NULL,
    "icon" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationUrl" TEXT NOT NULL,
    "typeId" INTEGER,
    "annual" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "cancelled" BOOLEAN NOT NULL,
    "playAndWinAnnounced" BOOLEAN NOT NULL,
    "playAndWinSelected" BOOLEAN NOT NULL,
    "doorPrizesAnnounced" BOOLEAN NOT NULL,
    "doorPrizeCollectionId" INTEGER,
    "playAndWinCollectionId" INTEGER,

    CONSTRAINT "Convention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToCopy" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Convention_doorPrizeCollectionId_key" ON "Convention"("doorPrizeCollectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Convention_playAndWinCollectionId_key" ON "Convention"("playAndWinCollectionId");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToCopy_AB_unique" ON "_CollectionToCopy"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToCopy_B_index" ON "_CollectionToCopy"("B");

-- AddForeignKey
ALTER TABLE "UserOrganizationPermissions" ADD CONSTRAINT "UserOrganizationPermissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConventionPermissions" ADD CONSTRAINT "UserConventionPermissions_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "Convention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationDate" ADD CONSTRAINT "RegistrationDate_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "Convention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "Copy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConventionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_doorPrizeCollectionId_fkey" FOREIGN KEY ("doorPrizeCollectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_playAndWinCollectionId_fkey" FOREIGN KEY ("playAndWinCollectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToCopy" ADD CONSTRAINT "_CollectionToCopy_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToCopy" ADD CONSTRAINT "_CollectionToCopy_B_fkey" FOREIGN KEY ("B") REFERENCES "Copy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
