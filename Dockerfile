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

FROM node:lts-alpine AS builder

ARG PINECONE_API_KEY
RUN if [ -z "$PINECONE_API_KEY" ]; then echo "PINECONE_API_KEY is not set" && exit 1; fi
ENV PINECONE_API_KEY=${PINECONE_API_KEY}

ARG PINECONE_INDEX_NAME
RUN if [ -z "$PINECONE_INDEX_NAME" ]; then echo "PINECONE_INDEX_NAME is not set" && exit 1; fi
ENV PINECONE_INDEX_NAME=${PINECONE_INDEX_NAME}

ARG SUNO_API_URL
RUN if [ -z "$SUNO_API_URL" ]; then echo "SUNO_API_URL is not set" && exit 1; fi
ENV SUNO_API_URL=${SUNO_API_URL}

ARG OLLAMA_BASE_URL
RUN if [ -z "$OLLAMA_BASE_URL" ]; then echo "OLLAMA_BASE_URL is not set" && exit 1; fi
ENV OLLAMA_BASE_URL=${OLLAMA_BASE_URL}

ARG OLLAMA_MODEL
RUN if [ -z "$OLLAMA_MODEL" ]; then echo "OLLAMA_MODEL is not set" && exit 1; fi
ENV OLLAMA_MODEL=${OLLAMA_MODEL}

ARG VISUAL_MODEL
RUN if [ -z "$VISUAL_MODEL" ]; then echo "VISUAL_MODEL is not set" && exit 1; fi
ENV VISUAL_MODEL=${VISUAL_MODEL}

ARG CORBADO_PROJECTID
RUN if [ -z "$CORBADO_PROJECTID" ]; then echo "CORBADO_PROJECTID is not set" && exit 1; fi
ENV CORBADO_PROJECTID=${CORBADO_PROJECTID}

ARG CORBADO_API_KEY
RUN if [ -z "$CORBADO_API_KEY" ]; then echo "CORBADO_API_KEY is not set" && exit 1; fi
ENV CORBADO_API_KEY=${CORBADO_API_KEY}

ARG APP_PORT
RUN if [ -z "$APP_PORT" ]; then echo "APP_PORT is not set" && exit 1; fi
ENV APP_PORT=${APP_PORT}

WORKDIR /ollama-server
COPY ollama-server/package.json .

RUN npm install

COPY ollama-server/public public
COPY --from=ngbuild client/dist/client /ollama-server/public
COPY ollama-server/index.js .
COPY ollama-server/controller controller
COPY ollama-server/middleware middleware
COPY ollama-server/routes routes
COPY ollama-server/security security

EXPOSE 3000

CMD ["npm", "run", "start"]