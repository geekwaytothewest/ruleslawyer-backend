# BoardGameGeek Integration

[BoardGameGeek](https://boardgamegeek.com) (BGG) is the canonical public
database of board game metadata. Ruleslawyer pulls metadata — player counts,
play time, designers/artists/publishers, complexity weight, cover art, etc. —
from BGG so library games don't have to be described by hand. Each local `Game`
([schema.prisma](../prisma/schema.prisma) `model Game`) carries an optional
`bggId` linking it to its BGG entry, an optional `bggVersionId` selecting a
specific edition's cover art (see
[Version cover art](#version-cover-art-bggversionid)), plus a `lastBGGSync`
timestamp.

The integration is read-only: Ruleslawyer never writes back to BGG. It only
fetches game data and cover images, then updates local `Game` rows.

Our API license with Board Game Geek requires our users to also use Tabletop.Events for registration. BGG Syncing can be turned off in cases where our users might be on a different platform.

## Setup

### API token

The BGG xmlapi2 calls send a bearer token from the `BOARDGAMEGEEK_API_TOKEN`
environment variable ([.env.template](../.env.template)). It is **required**;
every metadata request throws `BOARDGAMEGEEK_API_TOKEN is not set.` when it is
absent. (Image and rank-dump downloads do not use it.)

### Rank data dump (optional, for bulk sync)

The bulk sync can resolve `bggId`s for unconnected games **locally** from BGG's
`bg_ranks` data dump instead of one search request per game. The dump is a zip
fetched from a **signed, short-lived** URL at
[boardgamegeek.com/data_dumps/bg_ranks](https://boardgamegeek.com/data_dumps/bg_ranks).
Grab a fresh link each time and pass it as `dumpUrl`; expired links surface a
clear error (see [Rank-dump backfill](#rank-dump-backfill-getrankdumpindex--backfillbggidsfromrankdump)).

## How it works

The BGG API client lives in
[boardgamegeek.service.ts](../src/services/boardgamegeek/boardgamegeek.service.ts);
the orchestration (what to sync, persistence, batching) lives in
`GameService` ([game.service.ts](../src/services/game/game.service.ts)), exposed
through [game.controller.ts](../src/controllers/game/game.controller.ts).

### Endpoints

| Route                                          | Service method            | Notes                                                                 |
| ---------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `PUT /game/:id/syncWithBGG`                    | `syncBGGGame`             | Re-sync one game that already has a `bggId`. No-op if it has none.    |
| `PUT /game/:id/connectBGGByName`               | `connectBGGGameByName`    | Resolve a single game by name search, connect it, then sync.          |
| `PUT /game/:orgId/syncAndConnectGamesWithBGG`  | `startSyncAndConnect`     | Bulk sync for a whole organization. Returns **202** (runs in background). Optional `dumpUrl` in the body. |

### Single-game sync (`syncBGGGame`)

`GET thing?id=<bggId>&stats=1&versions=1` → parse XML → update the `Game` with
the [mapped fields](#field-mapping-bgg-thing--game), including an inline
cover-art download. `stats=1` pulls in the rank/rating block (`bggRank`,
`bggRating`); `versions=1` pulls in the editions so a `bggVersionId` can swap in
that edition's cover art (see
[Version cover art](#version-cover-art-bggversionid)). Lookups are by id with
**no `&type=boardgame` filter**, so expansions (`boardgameexpansion`) resolve
too. A game with no `bggId` is skipped.

### Connect by name (`connectBGGGameByName`)

`GET search?query=<name>` → take the first hit's id → fetch + map it as above.
The name is run through `normalizeBggName` first (see
[Name normalization](#name-normalization)).

### Bulk sync (`syncAndConnectGamesWithBGG`)

Launched via `startSyncAndConnect`, which returns **HTTP 202 immediately** and
runs the work in the background — a full org can take many minutes, longer than
client IPC / proxy idle timeouts allow. A module-level `syncInProgress` flag
guards against overlapping runs; a second attempt is rejected with **409**.
There is no job-status endpoint to poll — watch the server logs (the run logs a
rank-dump summary, per-batch progress, and a "BGG sync finished." line).

The run proceeds in phases:

1. **Reset the adaptive throttle** to its 2s baseline.
2. **Rank-dump backfill** (only if `dumpUrl` was supplied): resolve `bggId`s for
   games that lack one, locally, from the dump.
3. **Start the cover-art worker pool** (15 workers) draining a shared image
   queue concurrently with the API loop.
4. **Batch metadata loop**: all games with a `bggId` are chunked **20 per
   request** (the BGG `thing` batch limit). For each batch the loop sleeps the
   current throttle delay, fetches the batch, and updates each game's metadata in
   parallel — **deferring** cover-art downloads onto the image queue.
5. **Report unresolved games**: any game still without a `bggId` (unranked /
   obscure titles, or no `dumpUrl`) is logged and left unconnected. The bulk
   route does **not** fall back to per-game search — connect those individually
   via `connectBGGByName`.

#### Why cover art is deferred

Metadata comes from the rate-limited xmlapi2, but thumbnails come from a
separate image CDN. Downloading images inline would serialize them behind the
throttled API loop. Instead the loop queues `{ id, thumbnail }` jobs and a pool
of 15 workers (`drainCoverArtQueue`) downloads them in parallel, hiding the
image phase behind the API loop. The workers are started before the loop and
always awaited in a `finally`, so an error mid-run can't leave them polling
forever.

### Rank-dump backfill (`getRankDumpIndex` + `backfillBggIdsFromRankDump`)

`getRankDumpIndex` downloads the zip, extracts the CSV, and builds a
`normalizeBggName(name) -> RankDumpEntry[]` index (`{ id, year, rank }`).
It fails fast and clearly when the download isn't a real zip — a non-`PK` magic
header (an expired-link error page, a login redirect) or a status error both
raise an "expired/invalid signed URL" message rather than a cryptic
`adm-zip` failure.

`backfillBggIdsFromRankDump` matches each unconnected game's normalized name
against the index. On multiple candidates it prefers one whose `yearPublished`
matches, then the most popular (lowest `rank`, unranked treated as least
preferred), and logs the ambiguity. Matched games get their `bggId` set so the
batch loop can pick them up.

### Name normalization

`normalizeBggName` (exported from the BGG service) makes our names and BGG's
converge for fuzzy matching: NFKD + strip diacritics, lowercase, strip
punctuation, collapse whitespace, and drop leading articles. It handles articles
in two forms so the library's sort-name convention lines up with BGG's natural
order — a comma sort suffix (`"Castles of Burgundy, The"`) **and** a leading
article (`"The Castles of Burgundy"`) both reduce to `castles of burgundy`.

### Field mapping (BGG `thing` → Game)

Source fields are xmlapi2 attributes parsed by `fast-xml-parser`
(`@_value` / `@_id`). Anything missing maps to `null`.

| Game field        | Source                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| `bggId`           | `@_id`                                                                  |
| `minPlayers`      | `minplayers.@_value`                                                    |
| `maxPlayers`      | `maxplayers.@_value`                                                    |
| `minTime`         | `minplaytime.@_value` (minutes)                                         |
| `maxTime`         | `maxplaytime.@_value` (minutes)                                         |
| `minAge`          | `minage.@_value`                                                        |
| `weight`          | `statistics.ratings.averageweight.@_value` (complexity)                |
| `bggRank`         | `statistics.ratings.ranks.rank[@_name=boardgame].@_value` (`stats=1`; `Not Ranked` → left unset) |
| `bggRating`       | `statistics.ratings.average.@_value` (`stats=1`)                        |
| `longDescription` | `description`                                                           |
| `publisher`       | `link[@_type=boardgamepublisher]` values, joined with `, `             |
| `designer`        | `link[@_type=boardgamedesigner]` values, joined with `, `              |
| `artist`          | `link[@_type=boardgameartist]` values, joined with `, `                |
| `coverArt`        | Bytes downloaded from `thumbnail` — the version's thumbnail when `bggVersionId` is set ([Version cover art](#version-cover-art-bggversionid)); skipped/deferred in the bulk loop |
| `lastBGGSync`     | Current timestamp on every successful update                           |

Note: `name`, `shortDescription`, and `yearPublished` are **not** overwritten by
a sync — they stay as entered locally.

### Version cover art (`bggVersionId`)

A BGG `thing` carries one default `thumbnail`, but a game can have many editions
(reprints, language editions, deluxe versions), each with its own art. Setting a
`Game`'s `bggVersionId` pins the cover art to a specific edition's thumbnail
instead of the default.

This is why `thing` requests pass `&versions=1`: the response then nests each
edition as `<item type="boardgameversion">` inside `<versions>`. `bggUpdate`
parses those (the parser key is `item`, not `version`, and is normalized to an
array defensively), finds the one whose `@_id` equals the game's `bggVersionId`,
and **swaps its `thumbnail` in** before the download step. If no `bggVersionId`
is set, or no matching version is found, or that version has no thumbnail, the
game's default `thumbnail` is used unchanged.

The swap only changes **which URL** is handed to `getImage` — everything
downstream (the inline download, the deferred image queue, `getImage`'s own
retry/timeout) is identical. The single-game path does the swap inline in
`bggUpdate`; the bulk loop does it after the deferred `bggUpdate`, just before
pushing the `{ id, thumbnail }` job onto the image queue. The bulk batch select
therefore reads `bggVersionId` alongside `id` and `bggId`.

`Copy` has a parallel `bggVersionOverride` for per-copy art, distinct from the
game-level `coverArtOverride`/`bggVersionId`.

## Resilience

The client (`getWithRetry`) transparently handles the two transient responses
BGG returns under load:

- **202 "queued"** — a 2xx where the result isn't built yet. Retried with
  exponential backoff; after `maxRetries` the (empty) response is returned with a
  distinct warning.
- **429 "rate limited"** — a thrown 4xx. Retried honoring `Retry-After` (else
  exponential backoff); after `maxRetries` it is re-thrown so the caller's error
  handling stands.

Any other error is re-thrown unchanged.

### Adaptive throttle (AIMD)

The bulk loop paces itself with an adaptive inter-request delay. A 429
multiplicatively raises the delay (×1.5, capped at **8s**); clean responses
decay it back toward the **2s** baseline (−250ms steps). `resetThrottle()` is
called at the start of each run, and the loop reads `throttleDelayMs` between
batches. This lets the sync run fast when BGG is healthy and automatically back
off when it starts pushing back.

### Image fetches (`getImage`)

Cover-art downloads have their own retry: transient failures (429, 5xx, network
/ timeout) are retried with backoff; other 4xx (e.g. 404) bail immediately. Each
attempt is bounded by a timeout so a hung connection can't pin a worker slot.
Because the image CDN is a different host from the xmlapi2, a 429 here does
**not** bump the API loop's adaptive throttle.

`getImage` just downloads whatever URL it's handed; the choice of the game's
default thumbnail vs. a specific edition's is resolved upstream in `bggUpdate`
(see [Version cover art](#version-cover-art-bggversionid)). On any failure it
returns `null`, and the caller leaves the existing `coverArt` untouched rather
than clobbering it with an empty image.
