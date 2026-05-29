import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class CreateConventionPermissionDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsInt()
  conventionId: number;

  @ApiProperty()
  @IsBoolean()
  admin: boolean;

  @ApiProperty()
  @IsBoolean()
  geekGuide: boolean;

  @ApiProperty()
  @IsBoolean()
  attendee: boolean;
}
