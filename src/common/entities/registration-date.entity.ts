import { RegistrationDate } from '@prisma/client';

// Scalar response shape for RegistrationDate. See user.entity.ts for the pattern.
export class RegistrationDateEntity implements RegistrationDate {
  id: number;
  conventionId: number;
  name: string;
  startDate: Date;
  endDate: Date;
}
