import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConnectByIdDto } from '../../../common/dto/connect-relation.dto';

export class CreateCopyNewGameDto {
  @ApiProperty({ description: 'Name of the new game.' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

// Either connect an existing game or create a new one alongside the copy. The
// controller enforces that exactly one is supplied, and the new game's
// organization comes from the route rather than the body.
export class CreateCopyGameRelationDto {
  @ApiPropertyOptional({ type: ConnectByIdDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectByIdDto)
  connect?: ConnectByIdDto;

  @ApiPropertyOptional({ type: CreateCopyNewGameDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCopyNewGameDto)
  create?: CreateCopyNewGameDto;
}

// The collection, organization, and dateAdded are set by the controller from
// the route, so they are not part of the client-supplied body.
export class CreateCopyDto {
  @ApiProperty({ type: CreateCopyGameRelationDto, description: 'The game this copy is an instance of.' })
  @ValidateNested()
  @Type(() => CreateCopyGameRelationDto)
  game: CreateCopyGameRelationDto;

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
