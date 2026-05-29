import { ApiProperty } from '@nestjs/swagger';
import { GameEntity } from '../../../common/entities/game.entity';

// Response shape for the paginated `withCopies` listing. The `data` items
// include nested copies/checkOuts at runtime; only the base Game scalars are
// documented here (see GameEntity).
export class PaginatedGamesDto {
  @ApiProperty({ type: GameEntity, isArray: true })
  data: GameEntity[];

  @ApiProperty({ description: 'Total games matching the query (across all pages).' })
  total: number;

  @ApiProperty({ description: '1-based page number returned.' })
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasMore: boolean;
}
