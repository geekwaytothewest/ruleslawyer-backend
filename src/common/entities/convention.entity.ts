import { ApiProperty } from '@nestjs/swagger';
import { Convention, Prisma } from '@prisma/client';

// Scalar response shape for Convention. Bytes fields need an explicit
// @ApiProperty since the plugin can't map Prisma.Bytes; the rest are inferred.
export class ConventionEntity implements Convention {
  id: number;
  organizationId: number;
  name: string;
  theme: string;

  /** Logo image bytes stored in the database. */
  @ApiProperty({ type: String, format: 'binary' })
  logo: Prisma.Bytes;

  @ApiProperty({ type: String, format: 'binary' })
  logoSquare: Prisma.Bytes;

  icon: string;
  startDate: Date;
  endDate: Date;
  registrationUrl: string | null;
  typeId: number;
  /** Free-form annual identifier (e.g. the year or edition label). */
  annual: string;
  /** Expected/actual attendance count. */
  size: number | null;
  cancelled: boolean;
  /** Convention id in the external Tabletop.Events system. */
  tteConventionId: string | null;
}
