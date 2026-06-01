import { Copy } from '@prisma/client';

// Scalar response shape for Copy.
//
// coverArtOverride (Bytes) is intentionally excluded: the image blob is omitted
// from all read queries (see PrismaService) and served separately from
// `GET /api/copy/:id/cover`, so it is never part of this JSON response.
export class CopyEntity implements Omit<Copy, 'coverArtOverride'> {
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

  collectionId: number;
  organizationId: number;
}
