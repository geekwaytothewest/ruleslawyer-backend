import { ApiProperty } from '@nestjs/swagger';
import { Game, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Response shape for the Game scalar fields. `implements Game` makes the
// compiler fail if this drifts from the Prisma model, so the Swagger schema
// stays in sync without a generator. Relations (organization, copies) are not
// part of Prisma's base `Game` type and are documented separately where routes
// include them.
//
// Most fields are picked up automatically by the @nestjs/swagger CLI plugin;
// only the Prisma-specific types (Decimal, Bytes) need an explicit @ApiProperty
// because the plugin can't map them.
export class GameEntity implements Game {
  id: number;
  organizationId: number;
  /** BoardGameGeek game id used for metadata sync. */
  bggId: number | null;
  bggRank: number | null;
  bggRating: Decimal | null;
  /** Timestamp of the last successful BoardGameGeek sync. */
  lastBGGSync: Date | null;
  name: string;
  shortDescription: string | null;
  designer: string | null;
  artist: string | null;
  publisher: string | null;
  longDescription: string | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  /** Minimum expected play time in minutes. */
  minTime: number | null;
  /** Maximum expected play time in minutes. */
  maxTime: number | null;
  minAge: number | null;

  /** BGG complexity/weight rating, serialized as a decimal string. */
  @ApiProperty({ type: String, nullable: true, example: '2.34' })
  weight: Prisma.Decimal | null;

  /** Cover art image bytes stored in the database. */
  @ApiProperty({ type: String, format: 'binary', nullable: true })
  coverArt: Prisma.Bytes | null;

  yearPublished: number | null;
}
