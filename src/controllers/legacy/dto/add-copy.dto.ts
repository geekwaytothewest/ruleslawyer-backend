import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class LegacyAddCopyDto {
  @ApiProperty({ description: 'Numeric barcode/label for the new copy.' })
  @IsInt()
  libraryId: number;

  @ApiProperty({ description: 'Game title; the game is created if it does not exist.' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsBoolean()
  winnable: boolean;

  @ApiProperty()
  @IsString()
  comments: string;
}
