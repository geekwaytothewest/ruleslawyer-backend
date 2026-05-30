import { BadgeType } from '@prisma/client';

// Scalar response shape for BadgeType. See user.entity.ts for the pattern.
export class BadgeTypeEntity implements BadgeType {
  id: number;
  name: string;
}
