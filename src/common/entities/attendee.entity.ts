import { Attendee } from '@prisma/client';

// Scalar response shape for Attendee. See user.entity.ts for the pattern.
export class AttendeeEntity implements Attendee {
  id: number;
  conventionId: number;
  /** Display name printed on the badge. */
  badgeName: string;
  badgeFirstName: string;
  badgeLastName: string;
  legalName: string;
  userId: number | null;
  /** Convention-local badge number (unique within the convention). */
  badgeNumber: string;
  /** Scannable barcode encoded on the badge (unique within the convention). */
  barcode: string;
  badgeTypeId: number | null;
  /** Badge number/id from the external Tabletop.Events system. */
  tteBadgeNumber: number | null;
  tteBadgeId: string | null;
  email: string | null;
  pronounsId: number | null;
  /** Whether the attendee has checked in / arrived at the convention. */
  checkedIn: boolean;
  /** Whether the physical badge has been printed. */
  printed: boolean;
  registrationCode: string | null;
  merch: string | null;
  /** Whether the attendee is eligible to win game-copy prize drawings. */
  eligibleForPrizes: boolean;
  lostBadge: boolean;
}
