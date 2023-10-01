-- AlterTable
ALTER TABLE "Convention" ALTER COLUMN "theme" SET DEFAULT '',
ALTER COLUMN "logo" SET DEFAULT '\x',
ALTER COLUMN "logoSquare" SET DEFAULT '\x',
ALTER COLUMN "icon" SET DEFAULT '',
ALTER COLUMN "registrationUrl" SET DEFAULT '',
ALTER COLUMN "annual" SET DEFAULT '',
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "cancelled" SET DEFAULT false,
ALTER COLUMN "playAndWinAnnounced" SET DEFAULT false,
ALTER COLUMN "playAndWinSelected" SET DEFAULT false,
ALTER COLUMN "doorPrizesAnnounced" SET DEFAULT false;
