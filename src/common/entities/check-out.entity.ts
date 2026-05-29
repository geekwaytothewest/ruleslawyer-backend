import { CheckOut } from '@prisma/client';

// Scalar response shape for CheckOut. See user.entity.ts for the pattern.
export class CheckOutEntity implements CheckOut {
  id: number;
  attendeeId: number;
  checkOut: Date;
  /** Return timestamp; null while the copy is still out. */
  checkIn: Date | null;
  copyId: number | null;
  /** Whether the post-play ratings for this checkout have been submitted. */
  submitted: boolean;
}
