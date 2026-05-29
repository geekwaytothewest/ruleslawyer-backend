import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ConnectRelationDto } from '../../../common/dto/connect-relation.dto';

export class CreateAttendeeDto {
  @ApiProperty({ type: ConnectRelationDto, description: 'Convention this attendee belongs to.' })
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  convention: ConnectRelationDto;

  @ApiProperty({ description: 'Display name printed on the badge.' })
  @IsString()
  badgeName: string;

  @ApiProperty()
  @IsString()
  badgeFirstName: string;

  @ApiProperty()
  @IsString()
  badgeLastName: string;

  @ApiProperty()
  @IsString()
  legalName: string;

  @ApiProperty({ description: 'Convention-local badge number (unique within the convention).' })
  @IsString()
  badgeNumber: string;

  @ApiProperty({ description: 'Scannable barcode encoded on the badge (unique within the convention).' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional({ type: ConnectRelationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  user?: ConnectRelationDto;

  @ApiPropertyOptional({ type: ConnectRelationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  badgeType?: ConnectRelationDto;

  @ApiPropertyOptional({ type: ConnectRelationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectRelationDto)
  pronouns?: ConnectRelationDto;

  @ApiPropertyOptional({ description: 'Badge number from the external Tabletop.Events system.' })
  @IsOptional()
  @IsInt()
  tteBadgeNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tteBadgeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Whether the attendee has checked in / arrived.' })
  @IsOptional()
  @IsBoolean()
  checkedIn?: boolean;

  @ApiPropertyOptional({ description: 'Whether the physical badge has been printed.' })
  @IsOptional()
  @IsBoolean()
  printed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  registrationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  merch?: string;

  @ApiPropertyOptional({ description: 'Whether the attendee is eligible to win prize drawings.' })
  @IsOptional()
  @IsBoolean()
  eligibleForPrizes?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  lostBadge?: boolean;
}
