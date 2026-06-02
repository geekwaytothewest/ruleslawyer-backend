FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

# Generate the Prisma client at build time so it's baked into node_modules
# (copied to the runtime stage below). This keeps it out of the container
# entrypoint, where running it on every boot delayed app.listen and tripped the
# ECS/ALB health checks before the server came up.
RUN npx prisma generate

FROM node:lts-alpine

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma/

EXPOSE 8080
CMD ["npm", "run", "start:migrate:prod"]