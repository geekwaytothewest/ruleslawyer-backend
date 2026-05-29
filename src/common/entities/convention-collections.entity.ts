import { ConventionCollections } from '@prisma/client';

// Scalar response shape for ConventionCollections. See user.entity.ts.
export class ConventionCollectionsEntity implements ConventionCollections {
  id: number;
  conventionId: number;
  collectionId: number;
}
