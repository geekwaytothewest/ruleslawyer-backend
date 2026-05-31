# Auth0 Tenant Setup

This document describes how to configure the **Auth0 tenant** that the Geekway
apps authenticate against — the API (resource server), the Action that injects
custom claims, and the application clients. It is the dashboard-side counterpart
to [`AUTHORIZATION.md`](../AUTHORIZATION.md), which describes how the backend
*consumes* the resulting tokens. Read that doc for how validation and guards
work in code; read this one to stand up (or reproduce) the tenant.

> Everything here lives in the Auth0 dashboard, not in this repo. The repo only
> stores the resulting IDs/URLs as environment variables (listed at the end).

## 1. Create the API (resource server)

The backend validates every token against a single API.

1. **Applications → APIs → Create API.**
2. **Identifier (audience):** choose a stable URI (e.g. `https://api.geekway...`).
   This value becomes `AUTH0_AUDIENCE` (backend) / `API_IDENTIFIER` (SPAs) /
   `AUTH0_AUDIENCE` (frontend). Every client must request *this* audience or
   Auth0 returns an **opaque** token that fails the API's RS256 check.
3. **Signing algorithm:** `RS256` — the backend only accepts RS256
   ([`jwt.strategy.ts`](../src/modules/authz/jwt.strategy.ts)).

Permissions/scopes are **not** used for authorization. The backend decides what
a user may do entirely from database role rows, not from token scopes (see
[`AUTHORIZATION.md`](../AUTHORIZATION.md)), so there is no need to define API
permissions or enable RBAC.

The API's issuer URL (your tenant domain, e.g.
`https://<tenant>.us.auth0.com/`) becomes `AUTH0_ISSUER_URL`. **It must keep its
trailing `/`** — the backend appends paths to it directly (`${issuer}.well-known/jwks.json`,
`${issuer}authorize`, `${issuer}oauth/token`).

## 2. Add the custom-claims Action (required)

This is the piece most easily missed. The backend does **not** read standard
OIDC claims — `validate()` rejects any token without a `user_email` claim, and
uses `user_name` when auto-provisioning a user. These are **non-standard claim
names**, so Auth0 will not emit them unless an Action adds them.

1. **Actions → Library → Build Custom → Login / Post Login.**
2. Set the claims on the **access token** (that's the token the API receives):

   ```js
   exports.onExecutePostLogin = async (event, api) => {
     api.accessToken.setCustomClaim('user_email', event.user.email);
     api.accessToken.setCustomClaim('user_name', event.user.name);
   };
   ```

3. **Deploy** the Action and add it to the **Login** flow.

This Action must be active for **every** client below, because all of them hit
the same API and the backend provisions the local `User` from `user_email` on
first request (see "Token → User resolution" in
[`AUTHORIZATION.md`](../AUTHORIZATION.md)). If login succeeds but the API returns
`401`, this Action is the first thing to check.

> Auth0 normally requires namespaced (URL-style) custom claims; bare names like
> `user_email` are accepted on **access tokens for a custom API** but would be
> silently dropped from ID tokens. Keep them on the access token as shown.

## 3. Create the application clients

Five clients talk to this one API. Create an Auth0 **Application** for each,
matching the type below, and request the API's audience in every login.

| Client | Auth0 application type | Grant / flow |
| --- | --- | --- |
| `ruleslawyer-frontend` | Regular Web Application | Authorization Code + PKCE (server-side, `@auth0/nextjs-auth0`) |
| Swagger UI (`/api/docs`) | Single Page Application | Authorization Code + PKCE (in-browser) |
| `frontends/board-game-admin` | Single Page Application | Auth Code + PKCE + refresh-token rotation |
| `frontends/librarian` | Single Page Application | Auth Code + PKCE + refresh-token rotation |
| `frontends/play-prize-entry` | Single Page Application | Auth Code + PKCE + refresh-token rotation |

For each, configure in the application's **Settings**:

- **Allowed Callback URLs** — where Auth0 redirects after login (see per-client
  table below).
- **Allowed Logout URLs** — the post-logout return URL.
- **Allowed Web Origins / CORS** — the app's origin.
- **Grant Types** — Authorization Code (+ Refresh Token for the SPAs).

The SPAs enable refresh tokens with `localStorage` caching
(`useRefreshTokens: true`, `cacheLocation: 'localstorage'`), so enable
**Refresh Token Rotation** on those applications.

### Per-client URL/value reference

Hosting paths come from each app's webpack `publicPath` / nginx config; fill in
your real host. Each client must also register its **local Docker dev** callback
/ origin (ports from [`ruleslawyer-backend/docker-compose.yml`](../docker-compose.yml)),
so logins work against `docker compose up` — these are in `tenant.yaml`.

| Client | Callback URL | Logout URL | Docker dev callback / origin | Notes |
| --- | --- | --- | --- | --- |
| ruleslawyer-frontend | `<APP_BASE_URL>/auth/callback` | `<APP_BASE_URL>` | `http://localhost:8084/auth/callback` / `http://localhost:8084` | nextjs-auth0 mounts `/auth/*` (login, logout, callback). |
| Swagger UI | `<API_HOST>/api/docs/oauth2-redirect.html` | — | `http://localhost:8080/api/docs/oauth2-redirect.html` / `http://localhost:8080` | Uses `SWAGGER_AUTH0_CLIENT_ID`; sends `audience` as an extra authorize param. |
| board-game-admin | `<host>/legacy/admin/callback` (`AUTH_CALLBACK`) | `<host>/legacy/admin` (`LOGOUT_RETURN_URL`) | `http://localhost:8081/legacy/admin/callback` / `http://localhost:8081` | publicPath `/legacy/admin/`. |
| librarian | `<host>/legacy/librarian` (`AUTH_CALLBACK`) | `<host>/legacy/librarian` (`LOGOUT_RETURN_URL`) | `http://localhost:8082/legacy/librarian` / `http://localhost:8082` | publicPath `/legacy/librarian/`. |
| play-prize-entry | `<host>/legacy/playandwin` (`AUTH_CALLBACK`) | `<host>/legacy/playandwin` | `http://localhost:8083/legacy/playandwin` / `http://localhost:8083` | publicPath `/legacy/playandwin/`. |

### Per-client scopes requested at login

These are still requested by the client code, but the backend does not use them
for authorization (see step 1) — they have no effect on what a user may do.

- **ruleslawyer-frontend / Swagger UI:** `openid profile email`.
- **board-game-admin:** `openid offline_access profile`.
- **librarian:** `openid offline_access profile`.
- **play-prize-entry:** `openid offline_access`.

## 4. Backend CORS

Auth0 lets the browser obtain a token; the API still enforces its own CORS
allow-list ([`src/main.ts`](../src/main.ts)). Each client origin must appear in
the relevant `*_CLIENT_ORIGIN` / `RULESLAWYER_FRONTEND_ORIGIN` env var, or
authenticated cross-origin requests will be blocked before any token is checked.

## 5. Environment variables

These hold the IDs/URLs produced by the steps above. Actual values live in each
project's (gitignored) `.env`.

### Backend — [`.env.template`](../.env.template)

| Variable | Source | Purpose |
| --- | --- | --- |
| `AUTH0_ISSUER_URL` | Tenant domain (step 1), **trailing `/`** | JWKS lookup, issuer check, Swagger OAuth URLs. |
| `AUTH0_AUDIENCE` | API identifier (step 1) | Required audience on incoming tokens. |
| `SWAGGER_AUTH0_CLIENT_ID` | Swagger SPA app (step 3) | Client id for the `/api/docs` "Authorize" button. |
| `*_CLIENT_ORIGIN`, `RULESLAWYER_FRONTEND_ORIGIN[2]` | Each client's origin | CORS allow-list. |

### ruleslawyer-frontend — [`.env.template`](../../ruleslawyer-frontend/env.template)

| Variable | Source | Purpose |
| --- | --- | --- |
| `AUTH0_DOMAIN` | Tenant domain | Auth0 tenant. |
| `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` | Regular Web App (step 3) | Frontend app credentials. |
| `AUTH0_SECRET` | self-generated | Encrypts the session cookie. |
| `AUTH0_AUDIENCE` | API identifier | Must equal backend `AUTH0_AUDIENCE`. |
| `APP_BASE_URL` | deployment URL | Builds the `/auth/callback` redirect. |
| `API_URL` / `NEXT_PUBLIC_API_URL` | API host | Where the bearer token is sent. |

### Legacy SPAs ([`frontends/`](../../frontends)) — injected at build time

These apps have no runtime env; webpack `DefinePlugin` / `EnvironmentPlugin`
bake a `.env` into globals at build (see each app's `webpack.common.js`). Each
app ships a template:
[`board-game-admin/.env.template`](../../frontends/board-game-admin/.env.template),
[`librarian/.env.template`](../../frontends/librarian/.env.template),
[`play-prize-entry/.env.template`](../../frontends/play-prize-entry/.env.template).

| Global | Source | Purpose |
| --- | --- | --- |
| `AUTH_DOMAIN` | Tenant domain | Auth0 tenant. |
| `AUTH_CLIENT_ID` | the SPA's app (step 3) | This client's id. |
| `AUTH_CALLBACK` | Allowed Callback URL | Redirect URI. |
| `API_IDENTIFIER` | API identifier | Audience — must equal backend `AUTH0_AUDIENCE`. |
| `API_URL` | API host | Backend base URL. |
| `LOGOUT_RETURN_URL` | Allowed Logout URL | board-game-admin / librarian. |
