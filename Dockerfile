FROM node:20 AS builder

WORKDIR /usr/src/app

COPY . .

RUN npm install

RUN npm run build

FROM node:20

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma/

RUN echo $(ls)
RUN cd dist && echo $(ls)

EXPOSE 3000
CMD ["npm", "run", "start:migrate:prod"]