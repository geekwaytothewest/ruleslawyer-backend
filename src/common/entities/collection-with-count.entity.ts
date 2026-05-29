import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CollectionEntity } from './collection.entity';
import { ConventionCollectionsEntity } from './convention-collections.entity';

// Prisma `_count` for a Collection: the number of related copies and
// convention links.
export class CollectionCountEntity {
  @ApiProperty({ example: 42 })
  copies: number;

  @ApiProperty({ example: 3 })
  conventions: number;
}

// A Collection with its `_count` (and, for the single-collection route, its
// convention join rows). collectionsByOrg() includes only `_count`.
export class CollectionWithCountEntity extends CollectionEntity {
  @ApiPropertyOptional({ type: () => CollectionCountEntity })
  _count?: CollectionCountEntity;

  @ApiPropertyOptional({ type: () => ConventionCollectionsEntity, isArray: true })
  conventions?: ConventionCollectionsEntity[];
}
