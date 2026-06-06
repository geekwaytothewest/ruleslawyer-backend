import { OmitType } from '@nestjs/swagger';
import { ConventionTypeEntity } from './convention-type.entity';

// The convention type as embedded in convention responses: every scalar except
// the logo/logoSquare Bytes blobs, which the convention reads deliberately omit
// (see conventionTypeSelect in convention.service.ts) to keep payloads light.
export class ConventionTypeSummaryEntity extends OmitType(ConventionTypeEntity, [
  'logo',
  'logoSquare',
] as const) {}
