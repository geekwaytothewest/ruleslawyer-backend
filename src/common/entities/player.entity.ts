import { Player } from '@prisma/client';

// Scalar response shape for Player. See user.entity.ts for the pattern.
export class PlayerEntity implements Player {
  id: number;
  checkOutId: number;
  attendeeId: number;
  /** This player's rating of the game from the session. */
  rating: number | null;
  /** Whether the player wants to be entered to win this copy. */
  wantToWin: boolean;
}
