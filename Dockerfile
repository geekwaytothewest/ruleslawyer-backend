FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm install --legacy-peer-deps

RUN npm run build

FROM node:20-alpine

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma/

EXPOSE 8080
CMD ["npm", "run", "start:migrate:prod"]