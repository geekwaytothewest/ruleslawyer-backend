-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "checkoutId" INTEGER NOT NULL,
    "attendeeId" INTEGER NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "CheckOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
