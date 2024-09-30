
## Building docker image

```
docker build --no-cache -t kenken64/chatgpt --build-arg PINECONE_API_KEY=xxx --build-arg PINECONE_INDEX_NAME=pdf-genai --build-arg SUNO_API_URL=http://host.docker.internal:3001/api/ --build-arg OLLAMA_BASE_URL=http://host.docker.internal:11434 --build-arg OLLAMA_MODEL=llama3.1:8b --build-arg VISUAL_MODEL=minicpm-v --build-arg CORBADO_PROJECTID=xxxx --build-arg CORBADO_API_KEY=xxxx --build-arg APP_PORT=3000 .
```

## Running docker image 

--rm: This flag tells Docker to remove the container when the process running inside it exits.

```
docker run -p 3000:3000 --rm -d --name kenken64-chatgpt -e PINECONE_API_KEY=xxx -e PINECONE_INDEX_NAME=pdf-genai -e SUNO_API_URL=http://host.docker.internal:3001/api/ -e OLLAMA_BASE_URL=https://host.docker.internal:11434/ -e OLLAMA_MODEL=llama3.1:8b -e VISUAL_MODEL=minicpm-v -e CORBADO_PROJECTID=xxxx -e CORBADO_API_KEY=xxxx -e APP_PORT=3000 kenken64/chatgpt

docker run -p 3000:3000 -d --name kenken64-chatgpt -e PINECONE_API_KEY=xxx -e PINECONE_INDEX_NAME=pdf-genai -e SUNO_API_URL=http://host.docker.internal:3001/api/ -e OLLAMA_BASE_URL=http://host.docker.internal:11434 -e OLLAMA_MODEL=llama3.1:8b -e VISUAL_MODEL=minicpm-v -e CORBADO_PROJECTID=pro-0317338422706138772 -e CORBADO_API_KEY=xxxx -e APP_PORT=3000 kenken64/chatgpt

docker run --network host -d --name kenken64-chatgpt -e PINECONE_API_KEY=xxxx -e PINECONE_INDEX_NAME=pdf-genai -e SUNO_API_URL=http://host.docker.internal:3001/api/ -e OLLAMA_BASE_URL=http://host.docker.internal:11434 -e OLLAMA_MODEL=llama3.1:8b -e VISUAL_MODEL=minicpm-v -e CORBADO_PROJECTID=xxxx -e CORBADO_API_KEY=xxx -e APP_PORT=3000 kenken64/chatgpt
```

```
docker compose up -d --build

```