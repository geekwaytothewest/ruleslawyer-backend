FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npx prisma generate

RUN npm install

COPY . .

RUN npm run build

FROM node:20

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma/

EXPOSE 3000
CMD ["npm", "run", "start:migrate:prod"]