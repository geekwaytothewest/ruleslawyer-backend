FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY . .

# Install the lockfile EXACTLY (not a re-resolve). `npm install` can drift the
# transitive tree — notably it re-hoisted @prisma/dev's older query-plan-executor
# over the 7.8.0 the runtime needs, which imports @prisma/client-runtime-utils/dist
# (gone in 7.8.0) and crashed at query time. The lockfile pins the correct tree;
# `npm ci` reproduces it bit-for-bit. The package.json `overrides` enforce it too.
RUN npm ci

# Generate the Prisma client BEFORE the build: `nest build` type-checks against
# `@prisma/client`, whose model/`Prisma` types only exist after generation.
# (npm install doesn't auto-generate here — allow-scripts blocks the postinstall.)
# Generating at build time also bakes the client into node_modules for the
# runtime stage, instead of on every boot where it delayed app.listen and tripped
# the ECS/ALB health checks before the server came up.
RUN DATABASE_URL=none npx prisma generate

RUN npm run build

FROM node:24-alpine

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma/
COPY --from=builder /usr/src/app/prisma.config.ts ./

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npm", "run", "start:migrate:prod"]