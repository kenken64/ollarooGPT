# Builder angular
FROM node:22 AS ngbuild

# directory inside the image
WORKDIR /client

# Install Angular CLI
RUN npm i -g @angular/cli@18.2.4

COPY client/angular.json .
COPY client/package*.json .
COPY client/tsconfig*.json .
COPY client/angular.json .
COPY client/src src

RUN npm ci
RUN ng build

FROM node:lts-alpine AS backend


WORKDIR /ollama-server
COPY ollama-server/package.json .

RUN npm install

COPY --from=ngbuild client/dist/client/browser /ollama-server/public
COPY ollama-server/index.js .
COPY ollama-server/controller controller
COPY ollama-server/middleware middleware
COPY ollama-server/routes routes
COPY ollama-server/security security
COPY ollama-server/utils utils
COPY ollama-server/prisma prisma
COPY ollama-server/db db

RUN npx prisma generate

EXPOSE 3000

USER non-root CMD ["npm", "run", "start"]