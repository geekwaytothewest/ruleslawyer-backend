import { ApiProperty } from '@nestjs/swagger';
import { GameEntity } from './game.entity';
import { CopyWithRelationsEntity } from './copy-with-relations.entity';

// A Game with its copies (each copy including its checkOuts/game as populated
// by the route). Used by the game listing/detail routes that include copies.
export class GameWithCopiesEntity extends GameEntity {
  @ApiProperty({ type: () => CopyWithRelationsEntity, isArray: true })
  copies: CopyWithRelationsEntity[];
}
