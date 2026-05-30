import { User } from '@prisma/client';

// Scalar response shape for User. `implements User` keeps it in sync with the
// Prisma model at compile time; the @nestjs/swagger plugin infers @ApiProperty.
export class UserEntity implements User {
  id: number;
  email: string;
  name: string | null;
  username: string | null;
  /** Platform-wide administrator, bypassing scoped permission checks. */
  superAdmin: boolean;
  pronounsId: number | null;
}
