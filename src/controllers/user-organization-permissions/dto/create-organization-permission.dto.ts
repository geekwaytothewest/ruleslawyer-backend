import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt } from 'class-validator';

export class CreateOrganizationPermissionDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsInt()
  organizationId: number;

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
