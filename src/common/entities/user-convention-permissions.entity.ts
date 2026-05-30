import { UserConventionPermissions } from '@prisma/client';

// Scalar response shape for UserConventionPermissions. See user.entity.ts.
export class UserConventionPermissionsEntity
  implements UserConventionPermissions
{
  id: number;
  userId: number;
  conventionId: number;
  /** Full administrative control of the convention. */
  admin: boolean;
  /** "Geek Guide" role — staff/volunteer for this convention. */
  geekGuide: boolean;
  /** Standard attendee-level access. */
  attendee: boolean;
}
