import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString } from 'class-validator';

export class LegacyUpdateCopyDto {
  @ApiProperty({ description: 'New barcode label for the copy.' })
  @IsString()
  libraryId: string;

  @ApiProperty()
  @IsInt()
  collectionId: number;

  @ApiProperty()
  @IsBoolean()
  winnable: boolean;

  @ApiProperty()
  @IsString()
  comments: string;
}
