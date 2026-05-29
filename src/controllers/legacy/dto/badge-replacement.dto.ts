import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LegacyBadgeReplacementDto {
  @ApiProperty({ description: 'Badge number to replace from.' })
  @IsString()
  fromBadgeNumber: string;

  @ApiProperty({ description: 'New badge number.' })
  @IsString()
  toBadgeNumber: string;
}
