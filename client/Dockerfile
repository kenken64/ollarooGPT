# Builder angular
FROM node:22 AS ngbuild

# directory inside the image
WORKDIR /client

# Install Angular CLI
RUN npm i -g @angular/cli@17.3.8

COPY client/angular.json .
COPY client/package*.json .
COPY client/tsconfig*.json .
COPY client/angular.json .
COPY client/src src

RUN npm ci
RUN ng build

COPY ./dist/client ../ollama-server/public