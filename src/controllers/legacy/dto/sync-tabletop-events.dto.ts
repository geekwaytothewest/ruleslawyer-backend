import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class LegacySyncTabletopEventsDto {
  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsInt()
  tteBadgeNumber: number;

  @ApiProperty()
  @IsString()
  tteBadgeId: string;
}
