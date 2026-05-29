import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';

export class ConnectByIdDto {
  @ApiProperty()
  @IsInt()
  id: number;
}

// Mirrors Prisma's `{ connect: { id } }` relation input for connecting an
// existing record by primary key.
export class ConnectRelationDto {
  @ApiProperty({ type: ConnectByIdDto })
  @ValidateNested()
  @Type(() => ConnectByIdDto)
  connect: ConnectByIdDto;
}
