# Attendee Badge Setup

Each attendee at a convention is issued a physical badge carrying a scannable
barcode. That barcode is what ties an attendee to library checkouts, prize
entries, and game sessions when it is scanned at the desk.

## Badge identifiers

An `Attendee` ([schema.prisma](../prisma/schema.prisma) `model Attendee`)
carries several identifiers:

| Field            | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `barcode`        | The scannable barcode value encoded on the badge.                           |
| `badgeNumber`    | The convention-local badge number printed on the badge.                     |
| `tteBadgeNumber` | Badge number from the external Tabletop.Events system, if integrated.       |
| `tteBadgeId`     | Badge id from the external Tabletop.Events system, if integrated.           |

Each of these is unique **within a convention** (see the `@@unique` constraints
on `model Attendee`): `[conventionId, barcode]`, `[conventionId, badgeNumber]`,
and `[conventionId, tteBadgeNumber]`. Scoping uniqueness to the convention means
the same barcode value could be reused across different conventions without
collision, while a single scan unambiguously identifies one attendee at the
event where it is used.

## How badge barcodes are used

The badge barcode is scanned alongside a copy barcode whenever a game is checked
out. `CheckOutService.checkOut`
([check-out.service.ts](../src/services/check-out/check-out.service.ts)) looks
the attendee up by `conventionId_barcode`, then:

- Rejects the scan if no attendee matches the badge barcode in that convention.
- Enforces the per-attendee checkout limit (one game out at a time) unless
  `overrideLimit` is set.

This pairs the lending event to a specific attendee, so the copy barcode answers
*which game* and the badge barcode answers *who has it*. See
[PHYSICAL_LIBRARY_SETUP.md](./PHYSICAL_LIBRARY_SETUP.md) for how copy barcodes
work on the other side of that scan.
