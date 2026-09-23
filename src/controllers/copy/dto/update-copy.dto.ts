import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCopyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateAdded?: string;

  @ApiPropertyOptional({ description: "Human-readable label printed on the copy's barcode sticker." })
  @IsOptional()
  @IsString()
  barcodeLabel?: string;

  @ApiPropertyOptional({ description: 'Scannable barcode value.' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ description: 'When set, the copy has been removed from circulation.' })
  @IsOptional()
  @IsDateString()
  dateRetired?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Whether this copy is available to be won as a prize.' })
  @IsOptional()
  @IsBoolean()
  winnable?: boolean;

  @ApiPropertyOptional({
    description:
      "BoardGameGeek version id; when set, the copy's cover art is sourced from this version, overriding the game's default art.",
  })
  @IsOptional()
  @IsInt()
  bggVersionOverride?: number;

  @ApiPropertyOptional({
    description:
      'Moves the copy to this collection. The collection must belong to the same organization as the copy and must not be archived, and the barcode and barcode label must be unused in the target collection.',
  })
  @IsOptional()
  @IsInt()
  collectionId?: number;

  @ApiPropertyOptional({
    description:
      'Reassigns the copy to this game. The game must belong to the same organization as the copy.',
  })
  @IsOptional()
  @IsInt()
  gameId?: number;
}
