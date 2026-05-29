import { PartialType, PickType } from '@nestjs/swagger';
import { CreateOrganizationPermissionDto } from './create-organization-permission.dto';

// Only the permission flags are mutable, and all are optional so a caller can
// patch a single flag without resending the others.
export class UpdateOrganizationPermissionDto extends PartialType(
  PickType(CreateOrganizationPermissionDto, [
    'admin',
    'geekGuide',
    'readOnly',
  ] as const),
) {}
