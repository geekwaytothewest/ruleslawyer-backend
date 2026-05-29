import { Pronouns } from '@prisma/client';

// Scalar response shape for Pronouns. See user.entity.ts for the pattern.
export class PronounsEntity implements Pronouns {
  id: number;
  pronouns: string;
}
