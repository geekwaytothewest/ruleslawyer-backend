import { ApiProperty } from '@nestjs/swagger';
import { ConventionType, Prisma } from '@prisma/client';

// Scalar response shape for ConventionType. Bytes fields need an explicit
// @ApiProperty since the plugin can't map Prisma.Bytes; the rest are inferred.
export class ConventionTypeEntity implements ConventionType {
  id: number;
  name: string;
  description: string | null;

  /** Logo image bytes stored directly in the database. */
  @ApiProperty({ type: String, format: 'binary', nullable: true })
  logo: Prisma.Bytes | null;

  /** Square variant of the logo. */
  @ApiProperty({ type: String, format: 'binary', nullable: true })
  logoSquare: Prisma.Bytes | null;

  icon: string | null;
  content: string | null;
  organizationId: number;
}
