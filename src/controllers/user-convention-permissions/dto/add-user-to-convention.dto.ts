import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail } from 'class-validator';

export class AddUserToConventionDto {
  @ApiProperty()
  @IsEmail()
  email: string;

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
