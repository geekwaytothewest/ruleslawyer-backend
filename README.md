
## Description

Geekawy to the West Rules Lawyer is the premier play and win convention backend.

Requirements:

  Node v18.18.0

  PostgreSQL 14.9

  Auth0

## Installation

Git clone/pull this repository as well as the frontends repository into the same directory

Ex: ./git/ruleslawyer-backend
    ./git/frontends

Switch the frontends branch to New-Backend

Create .env file based on .env.template in each project (backend + frontend x 3)

If you haven't already, add yourself to prisma/seed.ts

## Running the app

```bash
$ docker compose up
```

The backend will be listening on: localhost:8080

The frontends will be listening on:
  - admin: localhost:8081
  - librarian: localhost:8082
  - play and win: localhost:8083

The database will be listening on: localhost:5432

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

- Contributors
  - [Mattie Schraeder](mailto:mattie@geekway.com)
  - [Libby Swanger](mailto:libby.swanger@gmail.com)
- Website - [https://geekway.com](https://geekway.com/)

## License

TBD?
