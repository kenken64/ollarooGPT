# MusicGen Backend Service Deployment Guide

This document provides instructions for setting up and deploying the MusicGen backend service using FastAPI and Uvicorn.

## Requirements

- Python 3.8 or higher
- PyTorch 1.10 or higher
- 8GB+ RAM for smaller models, 16GB+ recommended for medium/large models
- GPU with 8GB+ VRAM (optional but highly recommended)

## Installation

1. Clone the repository or download the source code.

2. Create a virtual environment:
   ```bash
   python -m venv musicgen-env
   source musicgen-env/bin/activate  # On Windows: musicgen-env\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

The service can be configured via environment variables:

- `PORT`: The port to run the server on (default: 8000)
- `MODEL_ID`: The MusicGen model to use (default: "facebook/musicgen-medium")
- `OUTPUT_DIR`: Directory to store generated audio files (default: "./generated_music")
- `MAX_NEW_TOKENS`: Maximum number of tokens for generation (default: 500)
- `SAMPLE_RATE`: Audio sample rate (default: 32000)

## Running the Service

Start the service with:

```bash
python app.py
```

For direct Uvicorn execution:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 1
```

Note: Use only 1 worker as the model is loaded in memory and multiple workers would duplicate the model.

## API Documentation

Once the service is running, you can access the auto-generated API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Response**: Status of the service

### Generate Music
- **URL**: `/api/generate`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "prompt": "An upbeat jazz song with saxophone",
    "duration": 30.0,
    "genre": "jazz",
    "instruments": ["saxophone", "piano", "drums"],
    "tempo": 120
  }
  ```
- **Response**: JSON with track ID and download URL

### Download Generated Track
- **URL**: `/api/download/{track_id}`
- **Method**: `GET`
- **Response**: WAV audio file

### List Available Models
- **URL**: `/api/models`
- **Method**: `GET`
- **Response**: List of available MusicGen models

## Example Usage

Using curl:

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "An electronic dance track with a driving beat", "duration": 20.0}'
```

Using Python requests:

```python
import requests

response = requests.post(
    "http://localhost:8000/api/generate",
    json={
        "prompt": "A classical piano piece with emotional depth",
        "duration": 45.0,
        "instruments": ["piano"]
    }
)

if response.status_code == 200:
    data = response.json()
    print(f"Track ID: {data['track_id']}")
    print(f"Download URL: {data['download_url']}")
    
    # Download the generated audio
    audio_response = requests.get(f"http://localhost:8000{data['download_url']}")
    with open("generated_music.wav", "wb") as f:
        f.write(audio_response.content)
```

## Deployment Options

### Docker Deployment

Here's a simple Dockerfile:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t musicgen-api .
docker run -p 8000:8000 -v $(pwd)/generated_music:/app/generated_music musicgen-api
```

### Production Deployment

For production environments:

1. Set up a reverse proxy (Nginx, Caddy, etc.)
2. Configure proper authentication
3. Consider using a process manager like Supervisord or systemd
4. Set up SSL/TLS for secure communication

## Resource Management

MusicGen models can be resource-intensive. Consider the following:

- For servers with limited memory, use the "small" model variant
- Generation time increases with longer requested durations
- Using a GPU significantly improves generation speed

## Troubleshooting

- If experiencing "CUDA out of memory" errors, try reducing `MAX_NEW_TOKENS` or using a smaller model
- If the service is slow, ensure you're using a GPU or consider using a smaller model
- For production use, implement proper authentication and rate limiting
