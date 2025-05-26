import os
import uuid
import logging
from typing import Optional, List, Dict, Any # 'Any' for the pipeline object type for now
from dataclasses import dataclass
import asyncio
import random

import torch
from fastapi import FastAPI, HTTPException, Query, Request, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from sse_starlette.sse import EventSourceResponse # For SSE
from fastapi.middleware.cors import CORSMiddleware
# Import pipeline from transformers, possibly with an alias
from transformers import pipeline as hf_transformer_pipeline
from pydantic import BaseModel, Field
import soundfile as sf # For saving audio

# --------------------------------------------------------------------------
# Logging Configuration
# --------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("musicgen_pipeline_api")

# --------------------------------------------------------------------------
# Application Configuration
# --------------------------------------------------------------------------
@dataclass
class MusicGenConfig:
    model_id: str = "facebook/musicgen-small"
    output_dir: str = "./generated_music_pipeline"
    tokens_per_second_approx: int = 50
    max_generation_tokens_cap: int = 3000 # Approx 60 seconds

config = MusicGenConfig()

# --------------------------------------------------------------------------
# Pydantic Models (Request/Response Schemas)
# --------------------------------------------------------------------------
class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Text description of the music to generate.")
    duration: Optional[float] = Field(30.0, gt=0, le=120, description="Desired duration in seconds (approximate, 1-120s).")
    genre: Optional[str] = Field(None, description="Specific genre to target.")
    instruments: Optional[List[str]] = Field(None, description="Instruments to include.")
    tempo: Optional[int] = Field(None, gt=0, description="Tempo in BPM (e.g., 120).")

class InitialGenerationResponse(BaseModel):
    task_id: str
    status: str
    message: str
    stream_url: str

class SSEEventData(BaseModel):
    status: str
    message: Optional[str] = None
    title: Optional[str] = None
    download_url: Optional[str] = None
    filename_suggestion: Optional[str] = None
    duration: Optional[float] = None
    track_id: Optional[str] = None

class SSEEvent(BaseModel):
    event: str
    data: SSEEventData

# --------------------------------------------------------------------------
# Global Variables for Pipeline and SSE
# --------------------------------------------------------------------------
synthesiser_pipeline: Optional[Any] = None # Stores the Hugging Face pipeline object
task_event_queues: Dict[str, asyncio.Queue] = {}

# For Random Song Titles
ADJECTIVES = ["Electric", "Cosmic", "Lost", "Forgotten", "Midnight", "Starlight", "Dreamy", "Retro", "Future", "Silent", "Whispering", "Golden", "Crystal", "Phantom", "Neon", "Velvet", "Mystic", "Galactic", "Lunar", "Solar", "Oceanic", "Crimson", "Emerald", "Sapphire", "Shadow", "Blazing", "Frozen", "Digital", "Analog"]
NOUNS_THEME = ["Journey", "Echoes", "Dreams", "Horizons", "Memories", "Secrets", "Odyssey", "Rhapsody", "Serenade", "Lullaby", "Symphony", "Pulse", "Rhythm", "Waves", "Sparks", "Nebula", "Galaxy", "Dimension", "Paradigm", "Chronicles", "Tales"]
NOUNS_ABSTRACT = ["Heartbeat", "Soul", "Mind", "Vision", "Reflection", "Illusion", "Destiny", "Mirage", "Vortex", "Frequency", "Signal", "Code", "Glitch", "Algorithm"]

# --------------------------------------------------------------------------
# FastAPI Application Initialization
# --------------------------------------------------------------------------
app = FastAPI(
    title="MusicGen API with Hugging Face Pipeline & SSE",
    description="API for generating music using MusicGen via HF Pipeline with SSE updates.",
    version="1.3.1", # Incremented version for the fix
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

cors_options = {
    "allow_origins": ["*"], # Be more specific in production
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
}
app.add_middleware(CORSMiddleware, **cors_options)

# --------------------------------------------------------------------------
# Pipeline Initialization
# --------------------------------------------------------------------------
def initialize_hf_pipeline():
    global synthesiser_pipeline
    if synthesiser_pipeline is not None:
        logger.info("Hugging Face pipeline already initialized.")
        return True

    logger.info(f"Initializing Hugging Face text-to-audio pipeline with model: {config.model_id}")
    try:
        device_id = 0 if torch.cuda.is_available() else -1
        effective_device = "cuda:0" if device_id == 0 else "cpu"
        logger.info(f"Loading pipeline on device: {effective_device} (device_id for pipeline: {device_id})")

        synthesiser_pipeline = hf_transformer_pipeline(
            "text-to-audio",
            model=config.model_id,
            device=device_id
        )
        logger.info("Hugging Face pipeline loaded.")
        os.makedirs(config.output_dir, exist_ok=True)
        logger.info(f"MusicGen pipeline for {config.model_id} initialized successfully.")
        return True
    except Exception as e:
        logger.error(f"CRITICAL ERROR during Hugging Face pipeline initialization: {str(e)}", exc_info=True)
        synthesiser_pipeline = None
        return False

# --------------------------------------------------------------------------
# Helper Functions
# --------------------------------------------------------------------------
def generate_random_song_title(prompt_keywords: Optional[List[str]] = None) -> str:
    parts = []
    if prompt_keywords:
        suitable_keywords = [kw.capitalize() for kw in prompt_keywords if kw.isalpha() and len(kw) > 3 and kw.lower() not in ["music", "song", "track", "audio", "beat"]]
        if suitable_keywords:
            parts.append(random.choice(suitable_keywords))
    if random.random() < 0.85 or not parts:
        parts.append(random.choice(ADJECTIVES))
    parts.append(random.choice(NOUNS_THEME if random.random() < 0.6 else NOUNS_ABSTRACT))
    title = " ".join(parts)
    return title.title()

def sanitize_filename(name: str, default_name="track") -> str:
    sanitized = "".join(c for c in name if c.isalnum() or c in [' ', '_', '-']).strip().replace(' ', '_')
    return sanitized if sanitized else default_name

# --------------------------------------------------------------------------
# Background Music Generation Task (Using Hugging Face Pipeline)
# --------------------------------------------------------------------------
async def perform_music_generation_and_notify(
    task_id: str,
    prompt: str,
    duration: float,
    genre: Optional[str],
    instruments: Optional[List[str]],
    tempo: Optional[int]
):
    event_queue = task_event_queues.get(task_id)
    if not event_queue:
        logger.error(f"SSE Queue not found for task_id {task_id} at generation start.")
        return

    if synthesiser_pipeline is None:
        logger.error(f"[Task: {task_id}] Hugging Face pipeline not initialized. Aborting generation.")
        err_data = SSEEventData(status="error", message="Server components not ready (pipeline). Please try again later.")
        await event_queue.put(SSEEvent(event="error", data=err_data).model_dump_json())
        await event_queue.put(None)
        return

    try:
        enhanced_prompt = prompt
        if genre: enhanced_prompt += f". Genre: {genre}."
        if instruments: enhanced_prompt += f". Instruments: {', '.join(instruments)}."
        if tempo: enhanced_prompt += f". Tempo: {tempo} BPM."
        logger.info(f"[Task: {task_id}] Enhanced prompt for pipeline: {enhanced_prompt}")

        prompt_keywords = [word for word in prompt.lower().split() if len(word) > 3]
        generated_title = generate_random_song_title(prompt_keywords)
        logger.info(f"[Task: {task_id}] Generated title: '{generated_title}'")

        update_data = SSEEventData(status="processing", message=f"Crafting '{generated_title}' with pipeline...", title=generated_title)
        await event_queue.put(SSEEvent(event="update", data=update_data).model_dump_json())

        max_tokens = int(duration * config.tokens_per_second_approx)
        actual_max_tokens = min(max_tokens, config.max_generation_tokens_cap)

        generation_params = {
            "max_new_tokens": actual_max_tokens,
            "do_sample": True,
            "guidance_scale": 3.0,
        }
        logger.info(f"[Task: {task_id}] Pipeline generation_params: {generation_params}")

        music_output_dict = synthesiser_pipeline(enhanced_prompt, forward_params=generation_params)
        
        # --- FIX FOR AUDIO SHAPE ---
        raw_audio_output = music_output_dict["audio"]
        logger.info(f"[Task: {task_id}] Raw audio output shape from pipeline: {raw_audio_output.shape}")

        if raw_audio_output.ndim == 3:
            # Handles (1, 1, N) or (1, C, N) by taking the first batch and first channel
            logger.info(f"[Task: {task_id}] Audio is 3D, selecting [0, 0, :] for mono.")
            audio_waveform_numpy = raw_audio_output[0, 0, :] # Assumes we want first channel if stereo
        elif raw_audio_output.ndim == 2 and raw_audio_output.shape[0] == 1:
            # Handles (1, N)
            logger.info(f"[Task: {task_id}] Audio is 2D (1, N), squeezing to 1D.")
            audio_waveform_numpy = raw_audio_output.squeeze()
        elif raw_audio_output.ndim == 1:
            # Handles (N,) - already correct
            logger.info(f"[Task: {task_id}] Audio is already 1D.")
            audio_waveform_numpy = raw_audio_output
        else:
            err_msg = f"Unexpected audio output shape from pipeline: {raw_audio_output.shape}. Cannot process for saving."
            logger.error(f"[Task: {task_id}] {err_msg}")
            raise ValueError(err_msg)
        
        logger.info(f"[Task: {task_id}] Processed audio_waveform_numpy shape for saving: {audio_waveform_numpy.shape}")
        # --- END FIX FOR AUDIO SHAPE ---
        
        pipeline_sampling_rate = music_output_dict["sampling_rate"]
        effective_sample_rate = pipeline_sampling_rate
        
        logger.info(f"[Task: {task_id}] Music generated with pipeline. Sampling rate: {effective_sample_rate} Hz.")

        output_filename_base = sanitize_filename(generated_title)
        server_filename = f"{task_id}.wav"
        output_path = os.path.join(config.output_dir, server_filename)

        sf.write(output_path, audio_waveform_numpy, effective_sample_rate)
        actual_duration = len(audio_waveform_numpy) / effective_sample_rate
        logger.info(f"[Task: {task_id}] Music saved to '{output_path}'. Actual duration: {actual_duration:.2f}s")

        client_suggested_filename = f"{output_filename_base}_{task_id[:8]}.wav"

        complete_data = SSEEventData(
            status="completed",
            message="Generation successful!",
            track_id=task_id,
            title=generated_title,
            download_url=f"/music/download/{task_id}", # Note: Paths for client should be consistent
            filename_suggestion=client_suggested_filename,
            duration=actual_duration
        )
        await event_queue.put(SSEEvent(event="complete", data=complete_data).model_dump_json())

    except Exception as e:
        logger.error(f"[Task: {task_id}] UNEXPECTED ERROR during pipeline music generation: {str(e)}", exc_info=True)
        err_data = SSEEventData(status="error", message=f"Generation failed: {str(e)}")
        await event_queue.put(SSEEvent(event="error", data=err_data).model_dump_json())
    finally:
        if event_queue:
            await event_queue.put(None)

# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("Application startup: Initializing Hugging Face pipeline...")
    if not initialize_hf_pipeline():
        logger.error("CRITICAL: Pipeline initialization failed on startup. API may not function correctly.")

@app.get("/music/health", tags=["General"]) # Changed path prefix to /api/ for consistency
async def health_check():
    """Checks API health and pipeline status."""
    if synthesiser_pipeline is None:
        raise HTTPException(status_code=503, detail="Music generation pipeline not initialized or loading failed.")
    return {"status": "ok", "model_id": config.model_id, "message": "API is healthy and pipeline is loaded."}

@app.post("/music/generate", response_model=InitialGenerationResponse, tags=["Music Generation"]) # Changed path
async def initiate_generation_endpoint(
    request_data: GenerationRequest, background_tasks: BackgroundTasks
):
    """Initiates music generation and returns a task ID for SSE streaming."""
    if synthesiser_pipeline is None:
        logger.error("Generate request received but pipeline not ready.")
        raise HTTPException(status_code=503, detail="Pipeline not ready. Please try again shortly.")

    task_id = str(uuid.uuid4())
    task_event_queues[task_id] = asyncio.Queue()
    logger.info(f"Task {task_id} created for prompt: '{request_data.prompt}' (using pipeline)")

    background_tasks.add_task(
        perform_music_generation_and_notify,
        task_id,
        request_data.prompt,
        request_data.duration,
        request_data.genre,
        request_data.instruments,
        request_data.tempo
    )
    return InitialGenerationResponse(
        task_id=task_id,
        status="queued",
        message="Music generation task initiated (pipeline). Connect to stream URL for updates.",
        stream_url=f"/music/stream-generation/{task_id}" # Path consistent with other /api/ routes
    )

async def sse_event_generator(task_id: str, http_request: Request):
    event_queue = task_event_queues.get(task_id)
    if not event_queue:
        logger.warning(f"SSE stream request for unknown or completed task_id: {task_id}")
        error_data = SSEEventData(status="error", message="Invalid or unknown task ID for streaming.")
        yield SSEEvent(event="error", data=error_data).model_dump_json()
        return

    logger.info(f"SSE connection established for task: {task_id}")
    try:
        while True:
            if await http_request.is_disconnected():
                logger.info(f"Client disconnected from SSE stream for task: {task_id}")
                break
            try:
                event_json_str = await asyncio.wait_for(event_queue.get(), timeout=1.0)
                if event_json_str is None:
                    logger.info(f"End of event stream signaled for task: {task_id}")
                    break
                yield event_json_str
            except asyncio.TimeoutError:
                continue
    except Exception as e:
        logger.error(f"Error in SSE generator for task {task_id}: {e}", exc_info=True)
        try:
            err_data = SSEEventData(status="error", message="Streaming error occurred on server.")
            yield SSEEvent(event="error", data=err_data).model_dump_json()
        except Exception: pass
    finally:
        logger.info(f"Closing SSE stream and cleaning up queue for task: {task_id}")
        if task_id in task_event_queues:
            q = task_event_queues[task_id]
            while not q.empty():
                try: q.get_nowait(); q.task_done()
                except asyncio.QueueEmpty: break
            del task_event_queues[task_id]

@app.get("/music/stream-generation/{task_id}", tags=["Music Generation"]) # Changed path
async def stream_generation_events(task_id: str, request: Request):
    """SSE endpoint to stream generation progress and results."""
    return EventSourceResponse(sse_event_generator(task_id, request), media_type="text/event-stream")

@app.get("/music/download/{track_id}", tags=["Music Generation"]) # Changed path
async def download_generated_track(track_id: str):
    """Downloads the generated audio file for the given track_id."""
    try:
        uuid.UUID(track_id)
        file_path = os.path.join(config.output_dir, f"{track_id}.wav")
        if not os.path.exists(file_path) or not os.path.isfile(file_path):
            logger.warning(f"Download request for non-existent track: {track_id} (Path: {file_path})")
            raise HTTPException(status_code=404, detail="Track not found or generation incomplete/failed.")
        return FileResponse(file_path, media_type="audio/wav", filename=f"musicgen_pipeline_{track_id}.wav")
    except ValueError:
        logger.warning(f"Download request with invalid track_id format: {track_id}")
        raise HTTPException(status_code=400, detail="Invalid track ID format.")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Unexpected error in download endpoint for track_id {track_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error while processing download.")

# --------------------------------------------------------------------------
# Server Execution
# --------------------------------------------------------------------------
if __name__ == "__main__":
    logger.info("Attempting to start MusicGen API server (using Hugging Face Pipeline)...")
    port = int(os.environ.get("PORT", 5001)) # Or your preferred default port
    import uvicorn
    uvicorn.run(
        "app:app",  # CRITICAL: If your filename is app.py, this is correct.
                     # If e.g. server.py, use "server:app".
        host="0.0.0.0",
        port=port,
        reload=True,
        workers=1,
        log_level="info"
    )