import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

// Credentials for the external Tabletop.Events API used to pull attendees.
export class ImportAttendeesDto {
  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  apiKey: string;
}
