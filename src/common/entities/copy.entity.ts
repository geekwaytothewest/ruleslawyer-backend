import { ApiProperty } from '@nestjs/swagger';
import { Copy, Prisma } from '@prisma/client';

// Scalar response shape for Copy. The Bytes field needs an explicit
// @ApiProperty since the plugin can't map Prisma.Bytes; the rest are inferred.
export class CopyEntity implements Copy {
  id: number;
  gameId: number;
  dateAdded: Date;
  /** Human-readable label printed on the copy's barcode sticker. */
  barcodeLabel: string;
  /** Scannable barcode value. */
  barcode: string;
  /** When set, the copy has been removed from circulation. */
  dateRetired: Date | null;
  comments: string | null;
  /** Whether this copy is available to be won as a prize. */
  winnable: boolean;
  winnerId: number | null;

  /** Per-copy cover art overriding the game's default art. */
  @ApiProperty({ type: String, format: 'binary', nullable: true })
  coverArtOverride: Prisma.Bytes | null;

  collectionId: number;
  organizationId: number;
}
