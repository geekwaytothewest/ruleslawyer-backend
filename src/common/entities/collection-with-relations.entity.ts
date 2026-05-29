import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CollectionEntity } from './collection.entity';
import { ConventionCollectionsEntity } from './convention-collections.entity';
import { OrganizationEntity } from './organization.entity';

// Prisma `_count` for a Collection: the number of related copies and
// convention links.
export class CollectionCountEntity {
  @ApiProperty({ example: 42 })
  copies: number;

  @ApiProperty({ example: 3 })
  conventions: number;
}

// A Collection with whichever relations a given route includes. All are
// optional because the includes vary: collection()/collectionsByOrg() add
// `_count` (+ `conventions`), searchCopies() adds `organization` + `conventions`,
// and convention() adds `_count`.
export class CollectionWithRelationsEntity extends CollectionEntity {
  @ApiPropertyOptional({ type: () => CollectionCountEntity })
  _count?: CollectionCountEntity;

  @ApiPropertyOptional({ type: () => OrganizationEntity })
  organization?: OrganizationEntity;

  @ApiPropertyOptional({ type: () => ConventionCollectionsEntity, isArray: true })
  conventions?: ConventionCollectionsEntity[];
}
