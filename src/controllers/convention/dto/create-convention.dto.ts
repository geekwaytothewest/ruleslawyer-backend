import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConnectRelationDto } from '../../../common/dto/connect-relation.dto';

export class CreateConventionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: ConnectRelationDto, description: 'Owning organization.' })
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  organization: ConnectRelationDto;

  @ApiProperty({ type: ConnectRelationDto, description: 'Convention type/branding.' })
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  type: ConnectRelationDto;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationUrl?: string;

  @ApiPropertyOptional({ description: 'Free-form annual identifier (e.g. the year or edition label).' })
  @IsOptional()
  @IsString()
  annual?: string;

  @ApiPropertyOptional({ description: 'Expected/actual attendance count.' })
  @IsOptional()
  @IsInt()
  size?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;

  @ApiPropertyOptional({ description: 'Convention id in the external Tabletop.Events system.' })
  @IsOptional()
  @IsString()
  tteConventionId?: string;
}
