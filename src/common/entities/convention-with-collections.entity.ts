import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConventionEntity } from './convention.entity';
import { ConventionCollectionsEntity } from './convention-collections.entity';
import { CollectionEntity } from './collection.entity';

// A ConventionCollections join row with its resolved collection, as returned by
// convention() (collections -> collection -> _count). The collection's _count
// is not modelled here.
export class ConventionCollectionEntity extends ConventionCollectionsEntity {
  @ApiPropertyOptional({ type: () => CollectionEntity })
  collection?: CollectionEntity;
}

// A Convention with its attached collections (the join rows + their
// collections). Used by GET /convention/:id.
export class ConventionWithCollectionsEntity extends ConventionEntity {
  @ApiProperty({ type: () => ConventionCollectionEntity, isArray: true })
  collections: ConventionCollectionEntity[];
}
