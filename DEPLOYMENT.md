# Deployment

All Rules Lawyer services run on **AWS ECS** and are released
via **GitHub Actions**. This is the canonical release guide for the apps; each
repo's README links here and lists only its own service names.

> **Infrastructure is defined and provisioned by the `ruleslawyer-infra` CDK
> project** — the ECS clusters and services, ECR repos, ALB/routing, RDS, IAM, and
> every **task definition** (container env vars, secrets, CPU/memory) live there
> and are its single source of truth. This repo's pipeline only ships a new image;
> it does not define or provision any of that. To stand up an environment, change
> runtime env/secrets/sizing, or migrate prod, see `ruleslawyer-infra`:
> `README.md` (deployment model), `DEPLOYMENT.md` (from-scratch bring-up), and
> `CUTOVER.md` (migrating the existing hand-built prod).

## How it works

Every service follows the same pipeline, triggered manually:

1. **Trigger** — run the repo's deploy workflow from the GitHub **Actions** tab
   (`workflow_dispatch`), choosing `nonprod` or `prod`.
2. **Build** — the workflow builds the Docker image.
3. **Push** — it's pushed to the service's **ECR** repo under two tags: the commit
   SHA (immutable record) and `latest` (what the CDK-owned task definition
   references).
4. **Deploy** — `aws ecs update-service --force-new-deployment` restarts the
   service on the `ruleslawyer-{env}` cluster so its tasks re-pull `latest`, then waits
   for the service to stabilize.

The workflow no longer renders or registers a task definition — CDK owns it.
Changing container env vars or secrets is an **infra change in `ruleslawyer-infra`**
(edit `config.ts`, `cdk deploy`), not a change in this repo.

## Services

| Repo                           | Workflow                | ECR repo / ECS service   |
| ------------------------------ | ----------------------- | ------------------------ |
| `ruleslawyer-backend`          | Build and Deploy        | `ruleslawyer-backend`    |
| `frontends` (board-game-admin) | Deploy Frontends to ECS | `frontends-admin`        |
| `frontends` (librarian)        | Deploy Frontends to ECS | `frontends-librarian`    |
| `frontends` (play-prize-entry) | Deploy Frontends to ECS | `frontends-play-and-win` |
| `ruleslawyer-frontend`         | Build and Deploy        | `ruleslawyer-frontend`   |

The `frontends` repo has a single **Deploy Frontends to ECS** workflow that fans
out to all three apps via reusable workflows; the others deploy independently.

## Environments

| Environment | ECS cluster       | Public host                  |
| ----------- | ----------------- | ---------------------------- |
| `nonprod`   | `ruleslawyer-nonprod` | `nonprod.library.ruleslawyer.net` |
| `prod`      | `ruleslawyer-prod`    | `library.ruleslawyer.net`        |

## Prerequisites

The workflows **deploy** to infrastructure that `ruleslawyer-infra` provisions — they
do **not** create it. Before a deploy can succeed:

- The environment must be stood up via `ruleslawyer-infra` (cluster, services, ECR
  repos, task definitions). See its `DEPLOYMENT.md`.
- The deploy credentials must target that environment's account. Auth is GitHub
  OIDC only — no static keys. The workflow assumes the per-app deploy role
  `ruleslawyer-{env}-github-deploy-backend` that the CDK creates; the job already
  declares `permissions: id-token: write` and selects the role ARN per
  environment (`PROD_ROLE_ARN` / `NONPROD_ROLE_ARN`).

  | Secret                                   | Purpose                                              |
  | ---------------------------------------- | ---------------------------------------------------- |
  | `AWS_REGION`                             | Target AWS region                                    |
  | `NONPROD_ROLE_ARN`, `PROD_ROLE_ARN`      | IAM role assumed per environment (this repo's own)   |
  | `API_URL`, `API_URL_NONPROD` (frontends) | Backend API base URL baked into the frontend bundles |

## Running a deploy

1. Open the repo on GitHub → **Actions** tab.
2. Select the deploy workflow (**Build and Deploy**, or **Deploy Frontends to
   ECS** for `frontends`).
3. Click **Run workflow**, choose `nonprod` or `prod`, and run it.
4. The job pushes the image and waits for the ECS service to reach a stable state.

## Notes

- **Runtime config lives in CDK, not here.** Container env vars, secrets, and
  CPU/memory are defined in `ruleslawyer-infrastructure` and are the source of truth. The
  workflow only ships a new image.
- **Frontend config is baked at build time.** The SPAs and the Next.js dashboard
  inline their API URL and Auth0 callback/logout URLs as Docker build args (e.g.
  `NEXT_PUBLIC_API_URL`), so changing them requires a rebuild, not just an infra
  change.
- **The backend runs migrations on startup** (`prisma migrate deploy` via its
  start command), so no separate migration step is part of the deploy.
- **Rollback** by re-tagging an earlier image as `latest` in ECR and forcing a new
  deployment, or by re-running the workflow against an earlier commit.
