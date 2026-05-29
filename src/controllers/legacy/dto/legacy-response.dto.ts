import { ApiProperty } from '@nestjs/swagger';

// The legacy admin/PNW-picker API wraps every payload in this envelope. The
// `Result` shape is route-specific and deeply nested, so it is documented as a
// generic object here rather than a per-route DTO; the envelope itself is what
// these endpoints guarantee.
export class LegacyResponseDto {
  @ApiProperty({ type: String, isArray: true, example: [] })
  Errors: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Route-specific payload (object or array).',
  })
  Result: unknown;
}
