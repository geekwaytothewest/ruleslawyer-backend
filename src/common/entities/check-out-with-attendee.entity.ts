import { ApiPropertyOptional } from '@nestjs/swagger';
import { CheckOutEntity } from './check-out.entity';
import { AttendeeEntity } from './attendee.entity';

// A CheckOut with its attendee resolved (as included by searchCopies()). The
// attendee is optional because the game-listing routes include checkOuts
// without it.
export class CheckOutWithAttendeeEntity extends CheckOutEntity {
  @ApiPropertyOptional({ type: () => AttendeeEntity })
  attendee?: AttendeeEntity;
}
