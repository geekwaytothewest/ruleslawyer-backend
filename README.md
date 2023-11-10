
## Description

Geekawy to the West Rules Lawyer is the premier play and win convention backend.

Requirements:

  Node v18.18.0

  PostgreSQL 14.9

  Auth0

## Installation

Setup PostgreSQL

Git clone/pull repository

Create .env file with the following contents:

```
DATABASE_URL=
AUTH0_ISSUER_URL=
AUTH0_AUDIENCE=
FASTIFY_PORT=
ADMIN_CLIENT_ORIGIN=
LIBRARIAN_CLIENT_ORIGIN=
PLAY_AND_WIN_CLIENT_ORIGIN=
```

Set the Database URL based on your PostgreSQL connection string

Set your Auth0 API data in Issuer URL and Audience

Choose a port to run Fastify on (Ex: 8080)

Set the Origin URLs to match the front ends (Ex: http://localhost:8081)

```bash
$ npm install
$ npx prisma migrate dev
```

Join the Geekway Postman

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

Postman:

Authenticate using ruleslawyer backend Authorization tab

Get Status

Get User

Create Organization

Create ConventionType

Create Convention

???

Profit

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- Author - [Mattie Schraeder](mailto:mattie@geekway.com)
- Website - [https://geekway.com](https://geekway.com/)

## License

TBD?
