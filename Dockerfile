FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

# Generate the Prisma client BEFORE the build: `nest build` type-checks against
# `@prisma/client`, whose model/`Prisma` types only exist after generation.
# (npm install doesn't auto-generate here — allow-scripts blocks the postinstall.)
# Generating at build time also bakes the client into node_modules for the
# runtime stage, instead of on every boot where it delayed app.listen and tripped
# the ECS/ALB health checks before the server came up.
RUN npx prisma generate

RUN npm run build

FROM node:lts-alpine

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma/

EXPOSE 8080
CMD ["npm", "run", "start:migrate:prod"]