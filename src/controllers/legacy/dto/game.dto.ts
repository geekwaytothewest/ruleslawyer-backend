import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// Shared by the legacy add- and update-game endpoints.
export class LegacyGameDto {
  @ApiProperty({ description: 'Game title.' })
  @IsString()
  title: string;
}
