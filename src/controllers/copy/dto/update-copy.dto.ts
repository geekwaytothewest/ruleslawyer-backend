import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
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
}
