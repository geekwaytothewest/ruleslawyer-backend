import { ApiProperty } from '@nestjs/swagger';
import { ConventionEntity } from './convention.entity';
import { ConventionTypeSummaryEntity } from './convention-type-summary.entity';

// A Convention with its resolved convention type (the `type` relation), as
// returned by the list endpoints conventionsByOrg() and conventions(). The
// embedded type omits the logo/logoSquare Bytes blobs (scalar select only).
export class ConventionWithTypeEntity extends ConventionEntity {
  @ApiProperty({ type: () => ConventionTypeSummaryEntity })
  type: ConventionTypeSummaryEntity;
}
