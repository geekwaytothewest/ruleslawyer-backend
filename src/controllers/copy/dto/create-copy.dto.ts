import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConnectRelationDto } from '../../../common/dto/connect-relation.dto';

// The collection, organization, and dateAdded are set by the controller from
// the route, so they are not part of the client-supplied body.
export class CreateCopyDto {
  @ApiProperty({ type: ConnectRelationDto, description: 'The game this copy is an instance of.' })
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  game: ConnectRelationDto;

  @ApiProperty({ description: "Human-readable label printed on the copy's barcode sticker." })
  @IsString()
  barcodeLabel: string;

  @ApiProperty({ description: 'Scannable barcode value.' })
  @IsString()
  barcode: string;

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
}
