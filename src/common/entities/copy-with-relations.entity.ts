import { ApiPropertyOptional } from '@nestjs/swagger';
import { CopyEntity } from './copy.entity';
import { CheckOutWithAttendeeEntity } from './check-out-with-attendee.entity';
import { GameEntity } from './game.entity';
import { CollectionWithRelationsEntity } from './collection-with-relations.entity';

// A Copy with its commonly-included relations. Different routes populate
// different subsets (copy() includes game+collection; copyWithCheckouts()
// includes checkOuts; searchCopies() includes all three, two levels deep:
// checkOuts->attendee and collection->organization/conventions), so the
// relations are optional and use the deepest variant available.
export class CopyWithRelationsEntity extends CopyEntity {
  @ApiPropertyOptional({ type: () => CheckOutWithAttendeeEntity, isArray: true })
  checkOuts?: CheckOutWithAttendeeEntity[];

  @ApiPropertyOptional({ type: () => GameEntity })
  game?: GameEntity;

  @ApiPropertyOptional({ type: () => CollectionWithRelationsEntity })
  collection?: CollectionWithRelationsEntity;
}
