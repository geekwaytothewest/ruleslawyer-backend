# Deployment

All Geekway to the West Rules Lawyer services deploy to **AWS ECS** via **GitHub Actions**. This is the canonical deployment guide; each repo's README links here and only lists its own service-specific names.

## How it works

Every service follows the same pipeline, triggered manually:

1. **Trigger** — run the repo's deploy workflow from the GitHub **Actions** tab (`workflow_dispatch`), choosing `nonprod` or `prod`.
2. **Build** — the workflow builds the Docker image and tags it with the commit SHA.
3. **Push** — the image is pushed to the service's **ECR** repository.
4. **Render** — `aws-actions/amazon-ecs-render-task-definition` injects the new image URI into `.aws/taskdefinition-{env}.json`.
5. **Deploy** — `aws-actions/amazon-ecs-deploy-task-definition` updates the ECS service on the `geekway-{env}` cluster and waits for the service to stabilize.

## Services

| Repo                                  | Workflow                  | ECR repo / ECS service    | Task definitions                          |
| ------------------------------------- | ------------------------- | ------------------------- | ----------------------------------------- |
| `ruleslawyer-backend`                 | Build and Deploy          | `ruleslawyer-backend`     | `.aws/taskdefinition-{nonprod,prod}.json` |
| `frontends` (board-game-admin)        | Deploy Frontends to ECS   | `frontends-admin`         | `.aws/taskdefinition-{nonprod,prod}.json` |
| `frontends` (librarian)               | Deploy Frontends to ECS   | `frontends-librarian`     | `.aws/taskdefinition-{nonprod,prod}.json` |
| `frontends` (play-prize-entry)        | Deploy Frontends to ECS   | `frontends-play-and-win`  | `.aws/taskdefinition-{nonprod,prod}.json` |
| `ruleslawyer-frontend`                | Build and Deploy          | `ruleslawyer-frontend`    | `.aws/taskdefinition-{nonprod,prod}.json` |

The `frontends` repo has a single **Deploy Frontends to ECS** workflow that fans out to all three apps via reusable workflows; the others are deployed independently.

## Environments

| Environment | ECS cluster        | Public host                                |
| ----------- | ------------------ | ------------------------------------------ |
| `nonprod`   | `geekway-nonprod`  | `nonprod.ruleslawyer.geekway.com` (apps), `nonprod.library.geekway.com/api` |
| `prod`      | `geekway-prod`     | `library.geekway.com`                      |

## Prerequisites

The workflows **deploy** to existing infrastructure — they do **not provision** it. The following must already exist before a deploy can succeed:

- The ECS clusters `geekway-nonprod` and `geekway-prod`.
- Each service's ECS service and its ECR repository (see the table above).
- The IAM roles referenced by `NONPROD_ROLE_ARN` / `PROD_ROLE_ARN`, with permission to push to ECR and update ECS.
- The following **GitHub Actions secrets** in each repo:

  | Secret                                   | Purpose                                              |
  | ---------------------------------------- | ---------------------------------------------------- |
  | `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`     | AWS credentials used to assume the deploy role       |
  | `AWS_REGION`                             | Target AWS region                                    |
  | `NONPROD_ROLE_ARN`, `PROD_ROLE_ARN`      | IAM role assumed per environment                     |
  | `API_URL`, `API_URL_NONPROD` (frontends) | Backend API base URL baked into the frontend bundles |

## Running a deploy

1. Open the repo on GitHub → **Actions** tab.
2. Select the deploy workflow (**Build and Deploy**, or **Deploy Frontends to ECS** for `frontends`).
3. Click **Run workflow**, choose `nonprod` or `prod`, and run it.
4. The job pushes the image and waits for the ECS service to reach a stable state before finishing.

## Notes

- **Runtime config lives in the task definition.** Container environment variables and secrets are defined in `.aws/taskdefinition-{env}.json`, not in the workflow. The workflow only swaps in the freshly built image.
- **Frontend config is baked at build time.** The SPAs and the Next.js dashboard inline their API URL and Auth0 callback/logout URLs as Docker build args (e.g. `NEXT_PUBLIC_API_URL`), so changing them requires a rebuild, not just a task-definition change.
- **The backend runs migrations and seeds on startup** (`prisma migrate deploy` via its start command), so no separate migration step is part of the deploy.
- **Rollback** by re-running the workflow against an earlier commit, or by rolling the ECS service back to a previous task-definition revision in the AWS console.
