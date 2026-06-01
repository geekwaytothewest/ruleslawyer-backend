import { Organization } from '@prisma/client';

// Scalar response shape for Organization. See user.entity.ts for the pattern.
export class OrganizationEntity implements Organization {
  id: number;
  name: string;
  ownerId: number;
  enableBggSupport: boolean;
}
