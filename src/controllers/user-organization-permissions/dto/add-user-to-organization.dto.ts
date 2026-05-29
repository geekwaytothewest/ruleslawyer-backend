import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail } from 'class-validator';

export class AddUserToOrganizationDto {
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
  readOnly: boolean;
}
