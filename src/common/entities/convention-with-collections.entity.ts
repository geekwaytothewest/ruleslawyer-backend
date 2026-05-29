import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConventionEntity } from './convention.entity';
import { ConventionCollectionsEntity } from './convention-collections.entity';
import { CollectionWithRelationsEntity } from './collection-with-relations.entity';

// A ConventionCollections join row with its resolved collection, as returned by
// convention() (collections -> collection -> _count).
export class ConventionCollectionEntity extends ConventionCollectionsEntity {
  @ApiPropertyOptional({ type: () => CollectionWithRelationsEntity })
  collection?: CollectionWithRelationsEntity;
}

// A Convention with its attached collections (the join rows + their
// collections). Used by GET /convention/:id.
export class ConventionWithCollectionsEntity extends ConventionEntity {
  @ApiProperty({ type: () => ConventionCollectionEntity, isArray: true })
  collections: ConventionCollectionEntity[];
}
