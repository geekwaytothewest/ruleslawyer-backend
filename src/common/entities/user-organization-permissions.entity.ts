import { UserOrganizationPermissions } from '@prisma/client';

// Scalar response shape for UserOrganizationPermissions. See user.entity.ts.
export class UserOrganizationPermissionsEntity
  implements UserOrganizationPermissions
{
  id: number;
  userId: number;
  organizationId: number;
  /** Full administrative control of the organization. */
  admin: boolean;
  /** "Geek Guide" role — staff/volunteer helping run library operations. */
  geekGuide: boolean;
  /** View-only access. */
  readOnly: boolean;
}
