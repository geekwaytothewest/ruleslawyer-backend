import { Collection } from '@prisma/client';

// Scalar response shape for Collection. See user.entity.ts for the pattern.
export class CollectionEntity implements Collection {
  id: number;
  name: string;
  organizationId: number;
  /** Whether the collection is visible publicly. */
  public: boolean;
  /** Whether copies in this collection may be won as prizes. */
  allowWinning: boolean;
  archived: boolean;
}
