# Tabletop.Events Integration

[Tabletop.Events](https://tabletop.events) (TTE) is the external registration
system conventions use to sell badges and track attendees. Ruleslawyer pulls
attendee/badge data from TTE's REST API so attendees can be looked up by badge
barcode at the library desk without re-entering them by hand. See
[ATTENDEE_BADGE_SETUP.md](./ATTENDEE_BADGE_SETUP.md) for how the resulting badge
barcodes are used.

The integration is read-only: Ruleslawyer never writes back to TTE. It only
fetches badges, badge types, and sold products, then upserts local `Attendee`
rows.

## Setup

### Link the convention to TTE

A `Convention` ([schema.prisma](../prisma/schema.prisma) `model Convention`)
carries an optional `tteConventionId` — the convention's id in the TTE system.
It is set when creating or updating a convention
([create-convention.dto.ts](../src/controllers/convention/dto/create-convention.dto.ts)).
**A sync cannot run without it**; `importAttendees` rejects with
`Convention missing tteConventionId.` when it is absent.

### TTE API credentials

Credentials are **not stored**. They are supplied per-request in the sync body
([import-attendees.dto.ts](../src/controllers/convention/dto/import-attendees.dto.ts)):

| Field      | Purpose                          |
| ---------- | -------------------------------- |
| `userName` | TTE account username             |
| `password` | TTE account password             |
| `apiKey`   | TTE API key id (`api_key_id`)    |

These three are exchanged for a short-lived TTE **session id**
(`POST https://tabletop.events/api/session`) at the start of every sync, and the
session id is then passed as `session_id` on each subsequent call.

## How the sync works

The TTE API client lives in
[tabletopevents.service.ts](../src/services/tabletopevents/tabletopevents.service.ts);
the orchestration lives in `ConventionService.importAttendees`
([convention.service.ts](../src/services/convention/convention.service.ts)).

### Endpoints that trigger a sync

| Route                                                  | Notes                                                   |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `POST /convention/:id/importAttendees`                 | Current endpoint. Full convention sync.                 |
| `PUT  /legacy/org/:orgId/con/:conId/attendees/sync/tabletopEvents` | Legacy endpoint; can also sync a single badge (`tteBadgeNumber` + `tteBadgeId` in the body). |

Both delegate to `ConventionService.startImportAttendees`.

### Background execution

Syncs are **long-running** (a full convention can be thousands of badges under
TTE's rate limit), so the endpoints return **HTTP 202 immediately** and the work
runs in the background. Progress is written to the server logs — there is no
job-status endpoint to poll; watch the logs (`Status Update: ...` lines report
page/badge progress).

A module-level `importInProgress` flag guards against overlapping runs: both TTE
and CSV imports write attendees to a convention, so only one import may run at a
time. A second attempt is rejected with **409**.

### Rate limiting

TTE enforces roughly **1 request/second**. The client honors this by
`sleep(1000)` between paged requests and after creating a session. To stay under
the limit on large cons, sold products are fetched in **one convention-wide
paginated sweep** (`getConventionSoldProducts`, 100 items/page) and grouped by
`badge_id` locally, rather than one request per badge — turning a ~3000-request
import into roughly 30–90 requests. The per-badge path
(`getSoldProducts`) is only used for single-badge syncs.

### Sync sequence (`importAttendees`)

1. Load the local convention; bail if it has no `tteConventionId`.
2. `getSession(userName, password, apiKey)` → TTE session id; bail on failure
   (`invalid tte session`).
3. `getBadgeTypes(tteConventionId, session)` — paged; bail if none
   (`no badge types found`).
4. Fetch badges:
   - **Single badge** (legacy path, when `tteBadgeId` is supplied):
     `getBadge(...)`, which also verifies the badge's `badge_number` and
     `convention_id` match.
   - **Full sync**: `getBadges(tteConventionId, session)` — paged, 100/page.
   - Bail if no badges (`no badges found`).
5. Fetch sold products (one sweep for full sync, per-badge for single) and group
   them by `badge_id`.
6. For each TTE badge, build an `Attendee` (see mapping below).
7. Upsert each attendee via `AttendeeService.syncAttendee`.

### Field mapping (TTE badge → Attendee)

| Attendee field   | Source                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| `badgeNumber`    | Derived: 2-digit start year + `convention.typeId` + TTE `badge_number` zero-padded to 4 |
| `barcode`        | `'*' + badgeNumber + '*'` (Code 39 style, wrapped in asterisks)                          |
| `tteBadgeNumber` | TTE `badge_number`                                                                       |
| `tteBadgeId`     | TTE badge `id`                                                                           |
| `badgeName` / `badgeFirstName` / `badgeLastName` | TTE `name` / `firstname` / `lastname`                                   |
| `legalName`      | `custom_fields.LegalName`, falling back to `name`                                        |
| `email`          | TTE `email`                                                                              |
| `badgeType`      | Resolved from `badgetype_id` against the fetched badge types; `connectOrCreate` by name  |
| `pronouns`       | `custom_fields.PreferredPronouns`, defaulting to `Prefer Not To Say`; `connectOrCreate`  |
| `merch`          | Sold-product variant names joined with `, `; `Patron` appended when the badge type name contains "Patron" |
| `registrationCode` | A freshly generated UUID                                                               |

### Idempotency

`AttendeeService.syncAttendee` **upserts** on the `conventionId_tteBadgeNumber`
unique key
([attendee.service.ts](../src/services/attendee/attendee.service.ts)). Re-running
a sync therefore updates existing attendees in place rather than duplicating
them, so it is safe to sync repeatedly as registrations change.

## Relationship to CSV import

For conventions not on TTE, attendees can instead be imported from a CSV
(`importAttendeesCSV`). That path shares the same `importInProgress` guard and
background-launch behavior, but sets `tteBadgeNumber` and `tteBadgeId` to `null`
and builds the badge barcode straight from the supplied badge number.
