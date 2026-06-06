import { ApiProperty } from '@nestjs/swagger';
import { ConventionEntity } from './convention.entity';
import { ConventionTypeEntity } from './convention-type.entity';

// A Convention with its resolved convention type (the `type` relation), as
// returned by the list endpoints conventionsByOrg() and conventions()
// (include: { type: true }).
export class ConventionWithTypeEntity extends ConventionEntity {
  @ApiProperty({ type: () => ConventionTypeEntity })
  type: ConventionTypeEntity;
}
