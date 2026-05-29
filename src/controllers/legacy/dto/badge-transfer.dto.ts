import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LegacyBadgeTransferDto {
  @ApiProperty({ description: 'Badge number to transfer from.' })
  @IsString()
  fromBadgeNumber: string;

  @ApiProperty()
  @IsString()
  newBadgeFirstName: string;

  @ApiProperty()
  @IsString()
  newBadgeLastName: string;

  @ApiProperty()
  @IsString()
  newBadgePronouns: string;
}
