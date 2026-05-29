import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class LegacyPrizeEntryPlayerDto {
  @ApiProperty({ description: "The attendee's id." })
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ nullable: true, description: '1-5 rating, or null if unrated.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number | null;

  @ApiProperty()
  @IsBoolean()
  wantsToWin: boolean;
}

export class LegacySubmitPrizeEntryDto {
  @ApiProperty()
  @IsInt()
  checkoutId: number;

  @ApiProperty({ type: [LegacyPrizeEntryPlayerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LegacyPrizeEntryPlayerDto)
  players: LegacyPrizeEntryPlayerDto[];
}
