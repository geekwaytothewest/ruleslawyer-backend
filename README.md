
## Description

Geekawy to the West Rules Lawyer is the premier play and win convention backend.

## Developer workstation setup

### Prerequisites

* Install Node v18.18.0 (Note: we recommend managing your Node version with `nvm`, because the frontend apps run in node v11.)
* Install PostgreSQL 14.9
* Ask Libby or Mattie to add you to the Geekway tenant in Auth0
* Create a Postman account (if you don't have one) and ask Libby or Mattie to add you to the Geekway team
* Download the Postman desktop client

## Installation

### Configure local application

Git clone/pull repository

Create a .env file with the following contents: 

```
FASTIFY_PORT=
ADMIN_CLIENT_ORIGIN=
LIBRARIAN_CLIENT_ORIGIN=
PLAY_AND_WIN_CLIENT_ORIGIN=
DATABASE_URL=
AUTH0_ISSUER_URL=
AUTH0_AUDIENCE=
```

Update the `.env` file with port 8080 for the Fastify URL.

```
FASTIFY_PORT=8080
```

The three client URL configuration variables are used for CORS configuration. Set the following lines in your `.env` file.

```
ADMIN_CLIENT_ORIGIN=http://localhost:8081
LIBRARIAN_CLIENT_ORIGIN=http://localhost:8082
PLAY_AND_WIN_CLIENT_ORIGIN=http://localhost:8083
```

### Set up Postgres

TODO: Need step-by-step instructions to
1. Set up a Postgres database
2. Connect to the instance with a CLI
3. Connect to the instance with a Postgres client
4. Figure out connection string details for config

In the `.env` file you created in the project root, set this line:

```
DATABASE_URL=tktktk
```

### Set up Auth0

**Add API configuration details for Auth0**

In your `.env` file, set the following values, which allow your local application to connect to Geekway's Auth0 tenant.

```
AUTH0_ISSUER_URL=https://geekway.auth0.com
AUTH0_AUDIENCE=https://api.ruleslawyer.geekway.com/
```

**Set up your application user**

1. In Auth0, in the left sidebar, go to **User Management > Users**. (If you don't see "User Management," click on the double right arrows at the bottom left of the screen. It should expand into a full sidebar.)
2. Click on **Create User**. Supply the email you'll use for your library software account, a password, and a usernaem. Leave **Connection** set to `Username-Password-Authentication`. 

### Set up Postman

1. Set up a Postman account (if you don't have one) and provide your Postman handle to Mattie or Libby. 
2. In the Postman client, go to the Rules Lawyer workspace.
3. Click on **Backend** in the left sidebar. This should open a set of tabs at the top.
4. Click on **Authorization**. Scroll to the bottom and click **Get New Access Token**.

Set TTE login in Import Attendees

## Running the app

```bash
$ npm install
$ npx prisma migrate dev
```

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

Authenticate using ruleslawyer-backend Authorization tab

Get Status

Get User

Create Organization

Create Convention

Import Attendees

Import Collections

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
