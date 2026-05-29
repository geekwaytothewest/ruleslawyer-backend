import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGameDto } from './create-game.dto';

// All fields optional, and the organization relation is dropped — games are not
// reparented to a different organization through an update.
export class UpdateGameDto extends PartialType(
  OmitType(CreateGameDto, ['organization'] as const),
) {}
