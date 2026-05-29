import { ApiPropertyOptional } from '@nestjs/swagger';
import { CopyEntity } from './copy.entity';
import { CheckOutEntity } from './check-out.entity';
import { GameEntity } from './game.entity';
import { CollectionEntity } from './collection.entity';

// A Copy with its commonly-included relations. Different routes populate
// different subsets (copy() includes game+collection; copyWithCheckouts()
// includes checkOuts; searchCopies() includes all three), so the relations are
// optional. Deeper nesting (checkOut.attendee, collection.organization) is not
// modelled — one level of relations is enough for an example.
export class CopyWithRelationsEntity extends CopyEntity {
  @ApiPropertyOptional({ type: () => CheckOutEntity, isArray: true })
  checkOuts?: CheckOutEntity[];

  @ApiPropertyOptional({ type: () => GameEntity })
  game?: GameEntity;

  @ApiPropertyOptional({ type: () => CollectionEntity })
  collection?: CollectionEntity;
}
