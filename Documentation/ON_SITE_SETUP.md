# On-Site Setup for Conventions

This is the operational runbook for standing up the Rules Lawyer system at a
convention (e.g. Geekway to the West). It covers the physical stations you need,
how each one connects to the deployed backend, what to do before doors open,
during the event, and the end-of-convention Play & Win drawing.

It assumes the backend and frontends are already **deployed** to AWS (see
[`../DEPLOYMENT.md`](../DEPLOYMENT.md)). On-site machines are just browsers and a
laptop pointed at those deployed services — nothing runs the Docker stack
locally at the convention.

## System overview

Everything on-site talks to the deployed `ruleslawyer-backend` API and
authenticates through Auth0. The pieces you interact with on the floor:

| Station            | What it runs                                   | Used by                  |
| ------------------ | ---------------------------------------------- | ------------------------ |
| Library checkout   | Librarian frontend (`/legacy/librarian`) + scanner | Library attendants       |
| Play & Win kiosk   | Play-prize-entry frontend (`/legacy/playandwin`) | Attendees (self-serve)   |
| Admin station      | Board-game-admin frontend (`/legacy/admin`)     | Convention organizers    |
| Drawing laptop     | `pnw-picker` (standalone Python/Gooey tool)    | Organizers, end of con   |

In production these frontends are served behind CloudFront at the convention's
public host; routes and hosts are listed in [`../DEPLOYMENT.md`](../DEPLOYMENT.md)
(prod: `library.ruleslawyer.net`, nonprod: `nonprod.library.ruleslawyer.net`).

## Stations and hardware

### Library checkout (one or more)

- A machine running the **librarian** frontend (`/legacy/librarian`) in a browser.
- A **barcode scanner** (USB or Bluetooth, configured as a keyboard-emulation
  HID device) for scanning game and badge barcodes.
- Recommended: a wired or otherwise stable network connection — checkouts and
  check-ins are the most latency-sensitive operation on the floor.
- Attendees can normally only have one game checked out at a time. The librarian
  app has an **override-limit** toggle that lets an attendant check out more than
  one game to the same attendee — used for things like a base game plus its
  expansions. The deployed build can start with this toggle already enabled via
  the `ALWAYS_OVERRIDE_LIMIT` build arg (see the `frontends` repo).

### Play & Win kiosks (one or more)

- A kiosk device running the **play-prize-entry** frontend (`/legacy/playandwin`).
  Geekway uses iPads in kiosk/guided-access mode.
- These are self-serve: attendees record the games they've played so they're
  eligible for the end-of-con Play & Win drawing.
- Lock the device to the single tab/URL so attendees can't navigate away.

### Admin station (at least one)

- Any computer that can reach the **board-game-admin** frontend (`/legacy/admin`) and,
  if you're running the drawing here, the `pnw-picker` tool.
- Used to manage the convention, games/copies, attendees, and permissions.

## Prerequisites before the convention

1. **Backend is deployed and scaled up.** The backend ECS service is normally
   scaled down between conventions and **scaled up before the event** (and back
   down afterward) — confirm it's up and healthy before relying on it on the
   floor. See the infra/scaling notes in `ruleslawyer-infra`.
2. **Convention data exists in the backend.** There must be an Organization, at
   least one Convention Type, and the current Convention configured. First-time /
   post-deploy setup (super admin assignment, org and convention-type creation)
   is described in the backend [`../README.md`](../README.md) → *Post Deployment
   Setup*.
3. **Auth0 logins work.** Staff accounts (library attendants, admins) can sign in
   via Auth0 and have the right permissions. The permission model (super admin,
   organization roles, convention roles) is documented in
   [`../AUTHORIZATION.md`](../AUTHORIZATION.md).
4. **Network/Wi‑Fi.** All stations can reach the public API host over the venue
   network. Verify from each station type, not just one.
5. **Barcode scanners** are paired/configured and tested against the librarian
   app (scan a known game and confirm it resolves).
6. **Game library is loaded** — copies and barcodes for the convention's games
   are in the system and match the physical barcodes on the boxes.

## Per-station setup steps

For each browser-based station:

1. Open the station's URL (the deployed host + the route from the table above).
2. Sign in through Auth0 with an account that has the appropriate role.
3. Confirm the app loads data from the API (e.g. the librarian app finds a known
   game; the admin app lists the current convention).
4. For kiosks, enable guided/kiosk mode and lock to the single URL.
5. For checkout stations, do a test scan end-to-end (check a game out and back
   in) before opening to attendees.

## During the convention

- **Checkouts/check-ins** happen at the library stations via barcode scan.
- **Play & Win entries** are recorded by attendees at the kiosks throughout the
  event — this data is what the drawing consumes.
- **Admins** handle exceptions, attendee/permission issues, and data corrections
  from the admin station.

## End-of-convention Play & Win drawing

The drawing is run with **`pnw-picker`**, a standalone tool (not part of the
Docker stack) that pulls game copies and plays from the library API, filters to
eligible plays, randomly selects winners per awardable copy, and produces winner
lists and printable labels.

High level:

1. Make sure all kiosk play entries are submitted and the backend is still up.
2. On the drawing laptop, run `pnw-picker` (Gooey GUI or headless CLI) against
   the API using its Auth0 machine-to-machine credentials.
3. It writes winners, printable labels, and any unawarded games to its output
   directory.

Setup, configuration (the `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` env vars),
selection methods (`old_school` vs `standard`), and usage are documented in the
`pnw-picker` repo's `README.md`. Do a dry run before the convention so the
environment, credentials, and label printing are known-good.

## After the convention

- Scale the backend ECS service back down once the drawing is complete and any
  exports you need are saved (see `ruleslawyer-infra`).
- Keep a copy of the drawing output (winners, labels, unawarded list).

## Troubleshooting

| Symptom                                   | Things to check                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| App won't load / spinner forever          | Station can't reach the API host; check venue Wi‑Fi/DNS and that the backend ECS service is scaled up and healthy. |
| Can sign in but no data / 403s            | Account is missing the right org/convention role — see [`../AUTHORIZATION.md`](../AUTHORIZATION.md). |
| Scanner does nothing / wrong characters   | Scanner not in keyboard-emulation (HID) mode, or focus isn't in the scan field. |
| Scan resolves to wrong/no game            | Game/copy not loaded for this convention, or physical barcode doesn't match the record. |
| Kiosk navigated away from the entry app   | Re-enable guided/kiosk mode and lock to the single URL.                         |
| `pnw-picker` returns no eligible plays    | Confirm kiosk entries were submitted and you're pointed at the right convention/API; review the eligibility filters in the `pnw-picker` README. |

## Related documentation

- [`../README.md`](../README.md) — running the stack, post-deployment setup, API access.
- [`../DEPLOYMENT.md`](../DEPLOYMENT.md) — environments, hosts, routes, deploy process.
- [`../AUTHORIZATION.md`](../AUTHORIZATION.md) — auth flow and permission model.
- `ruleslawyer-infra` — infrastructure, including convention-time backend scaling.
- `frontends` repo — the three web apps and their build/runtime config.
- `pnw-picker` repo — the Play & Win drawing tool.
