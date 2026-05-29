## Description

Geekway to the West Rules Lawyer is the premier play and win convention backend.

Built with [NestJS](https://nestjs.com/) (Fastify) + [Prisma](https://www.prisma.io/) on PostgreSQL, with Auth0 for authentication.

## Requirements

- Docker / Docker Compose
- Auth0 tenant (for auth)
- Node.js 20+ (only needed to run tests and tooling locally; the app itself runs in Docker)

## Installation

Clone the backend and both frontend repositories into the same parent directory. The `pnw-picker` (Play & Win prize-picker tool) is a standalone utility, not part of the Docker stack, but lives alongside the others:

```bash
git clone https://github.com/geekwaytothewest/ruleslawyer-backend.git
git clone https://github.com/geekwaytothewest/frontends.git
git clone https://github.com/geekwaytothewest/ruleslawyer-frontend.git
git clone https://github.com/geekwaytothewest/pnw-picker.git
```

Resulting layout:

```
geekway/
├── ruleslawyer-backend/
├── ruleslawyer-frontend/
├── pnw-picker/
└── frontends/
    ├── board-game-admin/
    ├── librarian/
    └── play-prize-entry/
```

Create an `.env` file from the `.env.template` in each project (backend, plus each frontend). Note: `ruleslawyer-frontend` uses `.env.docker`.

There is a database seed file for initial deployments available at [`prisma/seed.ts`](prisma/seed.ts).

## Running the app

```bash
docker compose --profile all up
```

On startup the backend container automatically runs Prisma migrations and seeds the database, so no manual migration step is required.

| Service             | URL                                |
| ------------------- | ---------------------------------- |
| Backend             | http://localhost:8080              |
| Backend debugger    | localhost:9229                     |
| Admin               | http://localhost:8081/admin        |
| Librarian           | http://localhost:8082/librarian    |
| Play and Win        | http://localhost:8083/playandwin   |
| Ruleslawyer dashboard | http://localhost:8084/ruleslawyer |
| Database (Postgres) | localhost:5432                     |

## Using compose profiles

Boot only the services you need with one or more profiles.

| Profile      | Services started                          |
| ------------ | ----------------------------------------- |
| `all`        | Everything                                |
| `backend`    | Backend + Postgres                        |
| `db`         | Postgres                                  |
| `ruleslawyer`| Backend + Postgres + Ruleslawyer dashboard |
| `frontends`  | Admin + Librarian + Play and Win          |
| `frontend`   | Ruleslawyer dashboard                     |
| `admin`      | Admin                                     |
| `librarian`  | Librarian                                 |
| `playandwin` | Play and Win                              |

Example — boot just the backend (with its database) and the admin frontend:

```bash
docker compose --profile backend --profile admin up
```

## API requests

There are two ways to explore and exercise the API:

- **Bruno** — a [Bruno](https://www.usebruno.com/) collection for hitting the API lives in [`bruno/Backend`](bruno/Backend).
- **Swagger UI** — interactive API docs are served at [`/api/docs`](http://localhost:8080/api/docs) (e.g. http://localhost:8080/api/docs when running locally). It is generated from the controllers, so every route, parameter, and request DTO is documented and can be tried out in the browser.

### Authenticating Swagger with Auth0

Swagger logs in through Auth0 directly (OAuth2 Authorization Code + PKCE) — click **Authorize**, sign in, and Swagger uses the returned token automatically. This requires:

- `SWAGGER_AUTH0_CLIENT_ID` set in `.env` to an Auth0 **Single Page Application** client id.
- That Auth0 application must list the Swagger redirect as an **Allowed Callback URL** and **Allowed Web Origin**, for each origin you use:
  - `http://localhost:8080/api/docs/oauth2-redirect.html` (local)
  - `https://<your-api-domain>/api/docs/oauth2-redirect.html` (deployed)

The authorize/token endpoints and audience are derived from the existing `AUTH0_ISSUER_URL` and `AUTH0_AUDIENCE` settings.

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

Deployed to AWS ECS via the **Build and Deploy** GitHub Action (manual `workflow_dispatch`; choose `nonprod` or `prod`). It builds the Docker image, pushes it to the `ruleslawyer-backend` ECR repo, and updates the `ruleslawyer-backend` ECS service on the `geekway-{env}` cluster using `.aws/taskdefinition-{env}.json`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full process, prerequisites, and the per-service reference for all repos.

## Post Deployment Setup

Post-deployment setup can be accomplished either through Bruno/Swagger or the Prisma seed file.

**Using Bruno or Swagger:**

1. Authenticate with Auth0.
2. Run the **Get Status** route. The system will detect the first user login and assign them Super Admin permissions.
3. Run the **Create Organization** route.
4. Run the **Create Convention Type** route for at least one convention type.

**Using the Prisma seed:**

Refer to [`prisma/example-seed.ts`](prisma/example-seed.ts).

## Documentation

Two top-level docs live at the repo root:

- [AUTHORIZATION.md](AUTHORIZATION.md) — the authentication flow (Auth0 + JWT) and the permission model (super admin, organization roles, convention roles) enforced by the route guards.
- [DEPLOYMENT.md](DEPLOYMENT.md) — the full deployment process, prerequisites, and per-service reference for all repos.

The rest of the documentation lives in [`Documentation/`](Documentation):

| Document | Covers |
| -------- | ------ |
| [DATABASE.md](Documentation/DATABASE.md) | Database structure — domain overview, ER diagram, and per-model field/relationship tables. The schema of record is [`prisma/schema.prisma`](prisma/schema.prisma). |
| [AUTH0_TENANT_SETUP.md](Documentation/AUTH0_TENANT_SETUP.md) | How to configure the Auth0 tenant (API/resource server, custom-claims Action, application clients) the apps authenticate against. |
| [BOARDGAMEGEEK.md](Documentation/BOARDGAMEGEEK.md) | The read-only BoardGameGeek (BGG) integration that pulls game metadata and cover art into local `Game` rows. |
| [TABLETOPEVENTS.md](Documentation/TABLETOPEVENTS.md) | The read-only Tabletop.Events (TTE) integration that pulls attendee/badge data for badge-barcode lookups. |
| [ATTENDEE_BADGE_SETUP.md](Documentation/ATTENDEE_BADGE_SETUP.md) | How attendee badge barcodes tie attendees to checkouts, prize entries, and game sessions. |
| [PHYSICAL_LIBRARY_SETUP.md](Documentation/PHYSICAL_LIBRARY_SETUP.md) | The barcode-based physical library model — Games (titles) vs. Copies (physical items). |
| [ON_SITE_SETUP.md](Documentation/ON_SITE_SETUP.md) | Operational runbook for standing up the system at a convention: stations, pre-doors prep, and the Play & Win drawing. |
| [LEGACY_CONTROLLER.md](Documentation/LEGACY_CONTROLLER.md) | The legacy admin/library controller — its root-mounted routes and older response envelope. |

Architecture references also live in [`Documentation/`](Documentation): the entity-relationship diagram in [`Documentation/ERD/`](Documentation/ERD) and the system diagram ([`System Diagram.drawio.png`](Documentation/System%20Diagram.drawio.png)).

## Stay in touch

- Contributors
  - [Mattie Schraeder](mailto:mattie@geekway.com)
  - [Libby Swanger](mailto:libby.swanger@gmail.com)
- Website - [https://geekway.com](https://geekway.com/)

## License

Licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE).
