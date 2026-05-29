import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ConnectByIdDto {
  @ApiProperty()
  @IsInt()
  id: number;
}

class OrganizationRelationDto {
  @ApiProperty({ type: ConnectByIdDto })
  @ValidateNested()
  @Type(() => ConnectByIdDto)
  connect: ConnectByIdDto;
}

export class CreateGameDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: OrganizationRelationDto })
  @ValidateNested()
  @Type(() => OrganizationRelationDto)
  organization: OrganizationRelationDto;

  @ApiPropertyOptional({ description: 'BoardGameGeek game id used for metadata sync.' })
  @IsOptional()
  @IsInt()
  bggId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  minPlayers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  maxPlayers?: number;

  @ApiPropertyOptional({ description: 'Minimum expected play time in minutes.' })
  @IsOptional()
  @IsInt()
  minTime?: number;

  @ApiPropertyOptional({ description: 'Maximum expected play time in minutes.' })
  @IsOptional()
  @IsInt()
  maxTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  minAge?: number;

  @ApiPropertyOptional({ description: 'BGG complexity/weight rating.' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  yearPublished?: number;
}
