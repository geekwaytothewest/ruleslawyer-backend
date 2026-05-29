import { OmitType } from '@nestjs/swagger';
import { CreateConventionDto } from '../../convention/dto/create-convention.dto';

// Same as CreateConventionDto, but the owning organization comes from the route
// param rather than the body.
export class CreateConventionForOrgDto extends OmitType(CreateConventionDto, [
  'organization',
] as const) {}
