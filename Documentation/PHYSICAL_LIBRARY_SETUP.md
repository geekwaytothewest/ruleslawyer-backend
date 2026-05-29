# Physical Library Setup

The collection system uses barcodes to track game checkouts. Each physical game in the library is treated as a copy with a unique barcode.

## Games vs. Copies

The library separates a game's catalog metadata from the physical items on the
shelf:

- A **Game** ([schema.prisma](../prisma/schema.prisma) `model Game`) is a board
  game *title* — its name, designer, player counts, BGG metadata, cover art,
  etc. A Game has **no barcode**. Metadata can be synced from BoardGameGeek via
  `bggId`.
- A **Copy** (`model Copy`) is a single physical, lendable instance of a Game.
  Copies are what actually get barcoded, checked out, returned, and won as
  prizes. A Game can have many Copies (e.g. three physical sets of *Catan*),
  each with its own barcode.

Checkouts, prize wins, and retirement all happen at the Copy level, never at the
Game level.

## A copy's two barcode fields

Every `Copy` carries two related fields:

| Field          | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `barcode`      | The scannable barcode value — the digits the scanner reads at the desk. |
| `barcodeLabel` | The human-readable label printed on the physical barcode sticker.       |

These are distinct so the value encoded in the barcode can differ from the
text a volunteer reads off the sticker, though in practice they are often the
same string.

### Uniqueness

Both fields are constrained to be unique within **two** scopes (see the
`@@unique` constraints on `model Copy`):

- Unique per collection: `[collectionId, barcode]` and `[collectionId, barcodeLabel]`
- Unique per organization: `[organizationId, barcode]` and `[organizationId, barcodeLabel]`

This means a barcode unambiguously identifies one copy both inside a single
collection and across an organization's entire library, so scans never have to
be disambiguated by hand.

## How barcodes are used in operations

### Adding a copy

When a copy is created
([create-copy.dto.ts](../src/controllers/copy/dto/create-copy.dto.ts)), the
client supplies the `game`, `barcode`, and `barcodeLabel`; the collection,
organization, and `dateAdded` are filled in by the controller from the route.

`CopyService.createCopy`
([copy.service.ts](../src/services/copy/copy.service.ts)) **upserts** on
`organizationId_barcodeLabel`. Re-submitting an existing barcode label updates
that copy in place rather than creating a duplicate, which makes bulk imports
and re-scans idempotent.

### Checking a copy out

`CheckOutService.checkOut`
([check-out.service.ts](../src/services/check-out/check-out.service.ts)) is
driven entirely by scanned barcodes. It takes a **copy barcode** and an
**attendee badge barcode** and:

1. Looks up the copy by `collectionId_barcode`.
2. Rejects the scan if that copy already has an open checkout (no `checkIn`).
3. Looks up the attendee by `conventionId_barcode` (the badge barcode — see
   below).
4. Rejects the scan if the attendee already has a game out, unless
   `overrideLimit` is set. The rejection message includes the game name and the
   `barcodeLabel` of the copy they already hold so the desk can find it.
5. Otherwise opens a new `CheckOut` record.

### Checking a copy in

`CheckOutService.checkIn` takes the **copy barcode**, looks the copy up by
`collectionId_barcode`, finds its open checkout, and stamps `checkIn`. Scanning
a copy that is already checked in is rejected.

### Editing / authorizing a copy

The copy authorization guard
([copy.guard.ts](../src/guards/copy/copy.guard.ts)) can resolve a copy by its
`organizationId_barcodeLabel` (via the `oldBarcodeLabel` route param) when no
numeric copy id is present, so barcode-label-keyed routes are protected the same
way id-keyed routes are.

## Attendee badge barcodes

Checkout also relies on a second, separate barcode: the one printed on each
attendee's **badge**. Checking a game out scans the copy barcode *and* the
attendee badge barcode together to tie the lending event to a specific
attendee. See [ATTENDEE_BADGE_SETUP.md](./ATTENDEE_BADGE_SETUP.md) for details
on badge identifiers and how they are used.
