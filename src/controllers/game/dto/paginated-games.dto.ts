import { ApiProperty } from '@nestjs/swagger';
import { GameWithCopiesEntity } from '../../../common/entities/game-with-copies.entity';

// Response shape for the paginated `withCopies` listing. Each item is a game
// with its nested copies (and their checkOuts).
export class PaginatedGamesDto {
  @ApiProperty({ type: GameWithCopiesEntity, isArray: true })
  data: GameWithCopiesEntity[];

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
