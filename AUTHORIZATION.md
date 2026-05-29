# Authorization

This document describes how `ruleslawyer-backend` authenticates requests and
decides whether a given user may perform a given action.

## Overview

Authorization happens in two layers:

1. **Authentication** — a global JWT strategy validates an Auth0-issued bearer
   token and resolves it to a `User` record from the database.
2. **Authorization** — per-route NestJS guards check that the resolved user has
   the right relationship to the resource being acted on (ownership, an
   organization role, or a convention role).

Every protected route lists `JwtAuthGuard` first, followed by one or more
authorization guards. Guards run in declaration order and **all** must return
`true` for the request to proceed.

```ts
@UseGuards(JwtAuthGuard, ConventionWriteGuard)
@Put(':id')
async updateConvention(...) { ... }
```

## Authentication

### JWT validation

`JwtStrategy` ([src/modules/authz/jwt.strategy.ts](src/modules/authz/jwt.strategy.ts))
extends Passport's `passport-jwt` strategy, registered under the name `gwJwt`.
It:

- Extracts a bearer token from the `Authorization` header.
- Validates the signature against Auth0's JWKS endpoint
  (`${AUTH0_ISSUER_URL}.well-known/jwks.json`), using `RS256`.
- Verifies the `audience` (`AUTH0_AUDIENCE`) and `issuer` (`AUTH0_ISSUER_URL`).

The relevant configuration comes from environment variables: `AUTH0_ISSUER_URL`
and `AUTH0_AUDIENCE`.

### Token → User resolution

In `validate()`, the strategy reads `user_email` from the token payload (a
missing email is rejected with `UnauthorizedException`) and then:

1. Looks up the `User` by email.
2. If no user exists, it **creates one** using `user_email` / `user_name` from
   the token. This means any successfully authenticated Auth0 identity is
   auto-provisioned a local account on first request.
3. **Bootstrap super admin:** if the newly created user has `id === 1` (i.e. the
   very first user in the system), they are promoted to `superAdmin`.

The resolved DB user is attached to the token payload as `payload.user`, and the
whole payload becomes `request.user`. So inside guards the DB user is reached
via `request.user.user` (note the double `.user`).

### `JwtAuthGuard`

[src/guards/auth/auth.guard.ts](src/guards/auth/auth.guard.ts) wraps the `gwJwt`
strategy. It short-circuits `OPTIONS` requests (CORS preflight) to `true`;
everything else must carry a valid token.

### `@User()` decorator

[src/modules/authz/user.decorator.ts](src/modules/authz/user.decorator.ts) is a
param decorator that pulls the DB user out of the request
(`request.user?.user`) so controllers can inject it directly:

```ts
async getConventions(@User() user: any) { ... }
```

## The permission model

Roles are stored in the database (see [prisma/schema.prisma](prisma/schema.prisma)),
not in the token. There are three sources of authority:

### 1. Super admin

`User.superAdmin` is a global boolean. **Every** authorization guard returns
`true` immediately if the user is a super admin — it bypasses all
resource-level checks.

### 2. Organization roles — `UserOrganizationPermissions`

Joins a `User` to an `Organization` (unique per `userId`/`organizationId`) with
three boolean flags:

| Flag        | Meaning |
|-------------|---------|
| `admin`     | Full control of the organization and everything under it. |
| `geekGuide` | Operational role (read/write convention data, check-outs, prize entries). |
| `readOnly`  | Read access to the organization and its collections. |

Separately, `Organization.ownerId` points to the owning `User`. The owner is
treated as equivalent to an org admin throughout the guards.

### 3. Convention roles — `UserConventionPermissions`

Joins a `User` to a `Convention` (unique per `userId`/`conventionId`) with three
boolean flags:

| Flag        | Meaning |
|-------------|---------|
| `admin`     | Full control of the convention. |
| `geekGuide` | Operational role within the convention. |
| `attendee`  | Limited access (read, prize entry). |

`createConvention`
([src/services/convention/convention.service.ts](src/services/convention/convention.service.ts))
does **not** seed any `UserConventionPermissions` rows. A newly created
convention has no explicit convention members; access is governed by the
caller's organization role, since the convention guards fall back to org
ownership / org `admin` / org `geekGuide` when no convention-level permission
exists (see [ConventionReadGuard / ConventionWriteGuard](#convention-guards)).
Convention-level permissions are granted explicitly afterward through the
permission-management endpoints.

## Guards

All resource guards follow the same skeleton: reject if no user → allow if super
admin → load the resource → allow if owner / has a qualifying role → otherwise
reject. They resolve the resource id from route params (commonly `id`, with
fallbacks like `conId`, `orgId`, `colId`, `copyId`, or the request body).

### Global / identity guards

| Guard | File | Allows when |
|-------|------|-------------|
| `JwtAuthGuard` | [auth/auth.guard.ts](src/guards/auth/auth.guard.ts) | Valid JWT (or `OPTIONS` preflight). |
| `SuperAdminGuard` | [superAdmin/superAdmin.guard.ts](src/guards/superAdmin/superAdmin.guard.ts) | `user.superAdmin` is true. Used to gate global operations (e.g. creating a convention). |
| `UserGuard` | [user/user.guard.ts](src/guards/user/user.guard.ts) | The route's `:id` matches the caller's own email or id, **or** caller is super admin. |
| `UserSelfGuard` | [user/user-self.guard.ts](src/guards/user/user-self.guard.ts) | Same as `UserGuard` but **without** the super-admin bypass — strictly self. |

### Organization guards

| Guard | File | Allows when (after super-admin bypass) |
|-------|------|----------------------------------------|
| `OrganizationReadGuard` | [organization/organization-read.guard.ts](src/guards/organization/organization-read.guard.ts) | Caller is org owner, or has org `admin`, `geekGuide`, or `readOnly`. |
| `OrganizationWriteGuard` | [organization/organization-write.guard.ts](src/guards/organization/organization-write.guard.ts) | Caller is org owner, or has org `admin` or `geekGuide`. |
| `OrganizationAdminGuard` | [organization/organization-admin.guard.ts](src/guards/organization/organization-admin.guard.ts) | Caller is org owner, or has org `admin`. Stricter than the write guard — excludes `geekGuide`. Used for org-management actions (creating conventions, convention types, collections, copies, importing/deleting collections). |

All three resolve the org id from `params.id` → `params.orgId` → `body.organizationId`.

### Convention guards

| Guard | File | Allows when (after super-admin bypass) |
|-------|------|----------------------------------------|
| `ConventionReadGuard` | [convention/convention-read.guard.ts](src/guards/convention/convention-read.guard.ts) | Convention role `admin`/`geekGuide`/`attendee`, **or** org owner, **or** org `admin`/`geekGuide`. |
| `ConventionWriteGuard` | [convention/convention-write.guard.ts](src/guards/convention/convention-write.guard.ts) | Convention role `admin`, **or** org owner, **or** org `admin`/`geekGuide`. |
| `ConventionAdminGuard` | [convention/convention-admin.guard.ts](src/guards/convention/convention-admin.guard.ts) | Convention role `admin`, **or** org owner, **or** org `admin`. Stricter than the write guard — the org fallback excludes `geekGuide`. Used for convention-management actions (update, attendee import/create, badge-file export). |

All three resolve the convention id from `params.id` → `params.conId`.

### Collection guards

| Guard | File | Allows when (after super-admin bypass) |
|-------|------|----------------------------------------|
| `CollectionReadGuard` | [collection/collection-read.guard.ts](src/guards/collection/collection-read.guard.ts) | Collection is `public`; or it's attached to a convention the caller can see; or org owner / org `admin`/`geekGuide`/`readOnly`. Resolves `params.colId`. |
| `CollectionWriteGuard` | [collection/collection-write.guard.ts](src/guards/collection/collection-write.guard.ts) | Org owner or org `admin`. **Rejects if the collection is `archived`** (this check runs before the super-admin bypass, so archived collections are read-only for everyone). Resolves `params.colId`. |

### Resource guards (org-admin scoped)

These load a child resource, walk up to its organization, and allow the org
owner or org `admin`.

| Guard | File | Resource |
|-------|------|----------|
| `GameGuard` | [game/game.guard.ts](src/guards/game/game.guard.ts) | A `Game` (`params.id`/`params.gameId`). |
| `CopyGuard` | [copy/copy.guard.ts](src/guards/copy/copy.guard.ts) | A `Copy`, looked up by `params.id`/`params.copyId` or by `orgId` + `oldBarcodeLabel`. Rejects if the copy's collection is `archived`. |

### Convention-operations guards (geek-guide scoped)

Used for floor operations during a convention. They verify the convention
belongs to the org in the route, then check convention/org roles.

| Guard | File | Allows when (after super-admin bypass) |
|-------|------|----------------------------------------|
| `CheckOutGuard` | [check-out/check-out.guard.ts](src/guards/check-out/check-out.guard.ts) | For the play-and-win collection: convention `admin`/`geekGuide`. Otherwise: org owner, or org `admin`/`geekGuide`. Requires `orgId`/`id` + `conId`. |
| `PrizeEntryGuard` | [prize-entry/prize-entry.guard.ts](src/guards/prize-entry/prize-entry.guard.ts) | Convention `admin`/`geekGuide`/`attendee`, or org owner, or org `admin`/`geekGuide`. |

### Permission-management guards

These gate the endpoints that create/update/delete the permission rows
themselves.

| Guard | File | Allows when (after super-admin bypass) |
|-------|------|----------------------------------------|
| `OrganizationPermissionsGuard` | [permissions/organization-permissions.guard.ts](src/guards/permissions/organization-permissions.guard.ts) | Loads the target `UserOrganizationPermissions` row by `params.id`, walks to its org, allows org owner or org `admin`. |
| `ConventionPermissionsGuard` | [permissions/convention-permissions.guard.ts](src/guards/permissions/convention-permissions.guard.ts) | Loads the target `UserConventionPermissions` row, walks convention → org, allows org owner or org `admin`. |
| `ConventionCreatePermissionsGuard` | [permissions/convention-create-permissions.guard.ts](src/guards/permissions/convention-create-permissions.guard.ts) | For creating a convention permission: resolves `body.conventionId` → org, allows org owner or org `admin`. |
| `OrganizationPermissionsSelfUpdateGuard` | [permissions/organization-permissions-self-update.guard.ts](src/guards/permissions/organization-permissions-self-update.guard.ts) | Allows only when the target permission's `userId` is **not** the caller — prevents editing/deleting your own org permission. |
| `ConventionPermissionsSelfUpdateGuard` | [permissions/convention-permissions-self-update.guard.ts](src/guards/permissions/convention-permissions-self-update.guard.ts) | Same self-protection for convention permissions. |

Because guards are AND-ed together, a permission update route like

```ts
@UseGuards(JwtAuthGuard, OrganizationPermissionsGuard, OrganizationPermissionsSelfUpdateGuard)
```

requires the caller to be an org admin/owner (or super admin) **and** to be
acting on someone other than themselves.

### Upload guard

`UploadGuard` ([upload/upload.guard.ts](src/guards/upload/upload.guard.ts)) is
not an authorization check — it rejects non-`multipart/form-data` requests for
file-upload endpoints.

## How a request is authorized (end to end)

1. The request arrives with an `Authorization: Bearer <jwt>` header.
2. `JwtAuthGuard` runs the `gwJwt` strategy: the token is validated against
   Auth0, the matching `User` is loaded (or created), and attached as
   `request.user.user`.
3. The next guard(s) in the route's `@UseGuards(...)` list run in order:
   - Super admin → allowed immediately.
   - Otherwise the guard loads the target resource, walks up to its convention
     and/or organization, and checks ownership and role flags.
   - If any guard returns `false`, the request is rejected (403).
4. If all guards pass, the controller handler runs. Handlers may further scope
   results to the caller — e.g. `ConventionService.conventions(user, ctx)` only
   returns conventions whose org or convention membership includes the user.

## Notes & caveats

- **Auto-provisioning:** any valid Auth0 token mints a local `User` on first
  use. Access is then governed entirely by the role rows that get assigned to
  that user.
- **First-user bootstrap:** the user with `id === 1` becomes super admin
  automatically. There is no other code path that grants `superAdmin`.
- **Owner ≈ org admin:** `Organization.ownerId` is checked directly in the
  guards and is treated as equivalent to an org admin everywhere.
- **`request.user.user`:** the double nesting (Passport payload `.user`, then
  the DB `User` at `.user`) is intentional — guards and the `@User()` decorator
  both rely on it.
- **Archived collections/copies** are blocked for writes by the collection/copy
  guards *before* the super-admin bypass, so not even a super admin can write to
  archived data through those routes.
