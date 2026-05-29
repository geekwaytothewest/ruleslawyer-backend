import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Whether copies in this collection can be won as prizes.' })
  @IsBoolean()
  allowWinning: boolean;
}
