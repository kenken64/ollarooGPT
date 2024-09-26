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

# ENV PINECONE_API_KEY=${PINECONE_API_KEY}
# ENV PINECONE_INDEX_NAME=${PINECONE_INDEX_NAME}
# ENV SUNO_API_URL=${SUNO_API_URL}
# ENV OLLAMA_BASE_URL=${OLLAMA_BASE_URL}
# ENV OLLAMA_MODEL=${OLLAMA_MODEL}
# ENV VISUAL_MODEL=${VISUAL_MODEL}
# ENV CORBADO_PROJECTID=${CORBADO_PROJECTID}
# ENV CORBADO_API_KEY=${CORBADO_API_KEY}
# ENV APP_PORT=${APP_PORT}

RUN echo $SUNO_API_URL
RUN echo $OLLAMA_BASE_URL
RUN echo $OLLAMA_MODEL

WORKDIR /ollama-server
COPY ollama-server/package.json .

RUN npm install

COPY ollama-server/public public
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

CMD ["npm", "run", "start"]