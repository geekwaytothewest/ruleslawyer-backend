import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

// One player's prize-entry submission for a play session. The checkOutId is set
// by the service from the route, so it is not part of the body.
export class SubmitPrizeEntryPlayerDto {
  @ApiProperty()
  @IsInt()
  attendeeId: number;

  @ApiProperty({ description: 'Whether the player wants to be entered to win this copy.' })
  @IsBoolean()
  wantToWin: boolean;

  @ApiPropertyOptional({ description: "The player's 1-5 rating of the game from the session." })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}
