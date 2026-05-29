# Legacy Controller

[`src/controllers/legacy/legacy.controller.ts`](../src/controllers/legacy/legacy.controller.ts)
backs the legacy admin/library applications. It predates the rest of the API
surface, so its routes are mounted at the root (no shared prefix) and its
responses follow an older envelope convention rather than the conventions used
by newer controllers.

## Response shape

Most endpoints return a uniform envelope:

```json
{ "Errors": [], "Result": ... }
```

On failure they throw NestJS HTTP exceptions whose body carries the same shape
(e.g. `{ "Errors": ["Copy not found."], "Result": null }`). Field names inside
`Result` are PascalCase (`ID`, `Name`, `BadgeNumber`), reflecting the legacy
clients that consume them. A few endpoints bypass the envelope and return the
raw service result (`gameList`, `getAttendeeByBadgeNumber`, the badge
transfer/replacement routes, CSV export).

## Routing and scoping

All routes are nested under an organization and convention:
`org/:orgId/con/:conId/...`. Path params arrive as strings and are coerced with
`Number(...)` before use. The controller holds a shared Prisma `Context`
(`this.ctx`) built once in the constructor and passed into every service call.

## Authorization

Every route is guarded by `JwtAuthGuard` plus a resource-scoped guard that
checks the caller's per-organization / per-convention permissions:

| Guard | Used for |
| --- | --- |
| `OrganizationReadGuard` / `OrganizationWriteGuard` | collection listing, imports, collection/game creation |
| `CollectionReadGuard` / `CollectionWriteGuard` | copy listing/creation, play export |
| `ConventionReadGuard` / `ConventionWriteGuard` | plays, attendee writes, imports, badge ops |
| `CopyGuard` | copy update |
| `CheckOutGuard` | checkout/checkin and copy lookups |
| `PrizeEntryGuard` | attendee list, prize entries, play submission |
| `SuperAdminGuard` | imported but not currently applied |

## Endpoint groups

The controller is a broad catch-all. Its endpoints cluster into a handful of
domains:

- **Collections & copies** — list collections with their copies
  (`getCopyCollections`), create/update copies, search copies, look up a single
  copy, create/update collections, and bulk import via CSV upload
  (`importCollection`, `uploadCopies`).
- **Attendees** — list (with optional search and a permission-based visibility
  fallback), create, update, look up by badge number, and CSV/Tabletop Events
  imports. Attendee names are split into first/last on write.
- **Check-in / check-out** — check a copy out to an attendee (with a
  one-game-per-attendee limit that can be overridden), check it back in, and
  report the longest-running and most recent checkouts. Copy lookups try several
  barcode forms (zero-stripped barcode, barcode label, raw barcode) before
  giving up.
- **Plays & prize entries** — list plays for a convention or a single
  collection, fetch an attendee's prize-eligible checkouts, submit a prize
  entry, and export plays for a collection as CSV.
- **Games** — list games with their copies (optionally filtered by
  collection), and create or update a game.
- **Badge operations** — transfer a badge to a new attendee, or replace one
  badge number with another.

## Notable behaviors

- **Duration math is duplicated inline.** Several endpoints compute a checkout's
  elapsed days/hours/minutes/seconds with the same hand-rolled millisecond
  arithmetic rather than a shared helper.
- **Barcode resolution is lenient.** Lookups commonly attempt the numeric
  (zero-stripped) barcode, then the barcode label, then the raw string, to
  tolerate how legacy scanners and clients format IDs.
- **Long-running imports are fire-and-forget.** `importAttendees` and
  `syncTabletopEvents` return `202 Accepted` immediately and kick off the work
  in the background so clients and proxies don't hold a request open for
  minutes.
- **Logging is verbose.** Each handler logs through `RuleslawyerLogger` at entry,
  on intermediate lookups, and on success/failure, which aids tracing requests
  from the legacy clients.

## Relationship to the rest of the system

This controller is intentionally a compatibility layer: it adapts the current
data model (see [`DATABASE.md`](./DATABASE.md)) to the request/response
expectations of older front-end applications.

Examples of those legacy consumers:

- [frontends](https://github.com/geekwaytothewest/frontends) — the legacy
  admin/library apps.
- [pnw-picker](https://github.com/geekwaytothewest/pnw-picker) — the legacy app
  for picking winners from play-and-win collections.

New functionality should generally live in a purpose-specific controller using
current conventions rather than be added here.
