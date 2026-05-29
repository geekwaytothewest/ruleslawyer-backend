import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// Shared by the legacy add- and update-attendee endpoints. The full name is
// split into first/last by the controller.
export class LegacyAttendeeDto {
  @ApiProperty()
  @IsString()
  badgeNumber: string;

  @ApiProperty({ description: 'Full display name; split into first/last by the server.' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  pronouns: string;
}
