import { ApiProperty } from '@nestjs/swagger';
import { AttendeeEntity } from '../../../common/entities/attendee.entity';

// Response shape for the paginated `:id/attendees` listing. Each item is an
// attendee with its pronouns and badge type.
export class PaginatedAttendeesDto {
  @ApiProperty({ type: AttendeeEntity, isArray: true })
  data: AttendeeEntity[];

  @ApiProperty({ description: 'Total attendees matching the query (across all pages).' })
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
