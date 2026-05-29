import { PartialType, PickType } from '@nestjs/swagger';
import { CreateConventionPermissionDto } from './create-convention-permission.dto';

// Only the permission flags are mutable, and all are optional so a caller can
// patch a single flag without resending the others.
export class UpdateConventionPermissionDto extends PartialType(
  PickType(CreateConventionPermissionDto, [
    'admin',
    'geekGuide',
    'attendee',
  ] as const),
) {}
