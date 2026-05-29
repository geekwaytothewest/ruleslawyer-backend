import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class LegacyCheckoutCopyDto {
  @ApiProperty()
  @IsString()
  attendeeBadgeNumber: string;

  @ApiProperty({ description: 'Barcode/label of the copy being checked out.' })
  @IsString()
  libraryId: string;

  @ApiProperty({ description: 'Bypass the one-checkout-per-attendee limit.' })
  @IsBoolean()
  overrideLimit: boolean;
}
