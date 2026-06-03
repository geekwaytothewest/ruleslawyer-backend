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

  @ApiProperty()
  @IsString()
  newBadgeEmail: string;

  @ApiProperty()
  @IsString()
  newBadgeName: string;

  @ApiProperty()
  @IsString()
  newBadgeLegalName: string;

  @ApiProperty({ description: 'ID of the pronouns to use for the new badge.' })
  newBadgePronounsId: number | null;
}
