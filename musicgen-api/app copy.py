import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoProcessor, MusicgenForConditionalGeneration
from pydantic import BaseModel, Field
import tempfile
import soundfile as sf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="MusicGen API",
    description="API for generating music using Meta's MusicGen model",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Music generation configuration
@dataclass
class MusicGenConfig:
    model_id: str = "facebook/musicgen-small"
    output_dir: str = "./generated_music"
    max_new_tokens: int = 500  # Roughly 10 seconds of audio
    sample_rate: int = 32000

# Request models
class GenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text description of the music to generate")
    duration: Optional[float] = Field(30.0, description="Duration in seconds (approximate)")
    genre: Optional[str] = Field(None, description="Specific genre to target")
    instruments: Optional[List[str]] = Field(None, description="Instruments to include")
    tempo: Optional[int] = Field(None, description="Tempo in BPM")
    
class GenerationResponse(BaseModel):
    track_id: str
    download_url: str
    duration: float
    
# Global variables
config = MusicGenConfig()
model = None
processor = None

def initialize_model():
    """Initialize the MusicGen model and processor"""
    global model, processor
    
    logger.info(f"Loading MusicGen model: {config.model_id}")
    
    # Load the model and processor
    try:
        model = MusicgenForConditionalGeneration.from_pretrained(config.model_id)
        processor = AutoProcessor.from_pretrained(config.model_id)
        
        # Check if CUDA is available and move model to GPU if possible
        if torch.cuda.is_available():
            logger.info("CUDA is available. Moving model to GPU.")
            model = model.to("cuda")
        else:
            logger.info("CUDA is not available. Using CPU.")
            
        # Create output directory if it doesn't exist
        os.makedirs(config.output_dir, exist_ok=True)
        
        logger.info("Model initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing model: {str(e)}")
        return False

def generate_music(prompt: str, duration: float = 30.0, 
                  genre: Optional[str] = None, 
                  instruments: Optional[List[str]] = None,
                  tempo: Optional[int] = None) -> Dict[str, Any]:
    """Generate music based on the given prompt and parameters"""
    
    # Enhance the prompt with additional parameters if provided
    enhanced_prompt = prompt
    if genre:
        enhanced_prompt += f". Genre: {genre}."
    if instruments and len(instruments) > 0:
        enhanced_prompt += f". Instruments: {', '.join(instruments)}."
    if tempo:
        enhanced_prompt += f". Tempo: {tempo} BPM."
    
    logger.info(f"Generating music with prompt: {enhanced_prompt}")
    
    # Calculate tokens needed for the requested duration
    # This is an approximation and might need adjustment based on the model
    tokens_per_second = config.max_new_tokens / 10
    max_tokens = int(duration * tokens_per_second)
    
    try:
        # Process the text prompt
        inputs = processor(
            text=[enhanced_prompt],
            padding=True,
            return_tensors="pt",
        )
        
        # Move inputs to the same device as the model
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            generated_audio = model.generate(
                **inputs,
                max_new_tokens=min(max_tokens, 3000),  # Limit to prevent OOM errors
                do_sample=True,
                temperature=0.7,
                guidance_scale=3.0,
            )
        
        # Convert to numpy array and normalize
        audio_data = generated_audio.cpu().numpy().squeeze()
        
        # Generate a unique ID for the track
        track_id = str(uuid.uuid4())
        
        # Create output file path
        output_path = os.path.join(config.output_dir, f"{track_id}.wav")
        
        # Save the audio file
        sf.write(output_path, audio_data, config.sample_rate)
        
        # Calculate actual duration
        actual_duration = len(audio_data) / config.sample_rate
        
        return {
            "track_id": track_id,
            "file_path": output_path,
            "duration": actual_duration,
        }
    
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        raise

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    if model is None or processor is None:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "message": "Model not initialized"}
        )
    
    return {"status": "ok", "model": config.model_id}

@app.post("/api/generate", response_model=GenerationResponse)
async def generate_endpoint(request: GenerationRequest):
    """Endpoint to generate music from a text prompt"""
    try:
        # Generate the music
        result = generate_music(
            prompt=request.prompt,
            duration=request.duration,
            genre=request.genre,
            instruments=request.instruments,
            tempo=request.tempo
        )
        
        # Build response
        response = GenerationResponse(
            track_id=result["track_id"],
            download_url=f"/api/download/{result['track_id']}",
            duration=result["duration"],
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Error in generate endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{track_id}")
async def download_track(track_id: str):
    """Endpoint to download a generated track"""
    try:
        # Validate track_id format (basic UUID validation)
        try:
            uuid_obj = uuid.UUID(track_id)
            if str(uuid_obj) != track_id:
                raise ValueError("Invalid UUID format")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid track ID format")
        
        # Construct file path
        file_path = os.path.join(config.output_dir, f"{track_id}.wav")
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Track not found")
        
        # Return the file
        return FileResponse(
            file_path, 
            media_type="audio/wav", 
            filename=f"generated_music_{track_id}.wav"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in download endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def list_models():
    """List available MusicGen models"""
    # This is a simplified list. In a production environment, 
    # you might want to dynamically fetch available models
    available_models = [
        {"id": "facebook/musicgen-small", "name": "MusicGen Small", "description": "Lightweight model, faster but less detailed"},
        {"id": "facebook/musicgen-medium", "name": "MusicGen Medium", "description": "Balanced between quality and resource usage"},
        {"id": "facebook/musicgen-large", "name": "MusicGen Large", "description": "Highest quality output, requires more resources"},
        {"id": "facebook/musicgen-melody", "name": "MusicGen Melody", "description": "Specialized for melodic content"},
    ]
    
    return available_models

if __name__ == "__main__":
    # Initialize the model before starting the server
    if initialize_model():
        # The server will be started by Uvicorn
        import uvicorn
        port = int(os.environ.get("PORT", 8000))
        
        logger.info(f"Starting Uvicorn server on port {port}")
        uvicorn.run(
            "app:app",  # Replace with your actual module name if different
            host="0.0.0.0",
            port=port,
            reload=False,  # Set to True during development
            workers=1,  # Keep at 1 since we're loading a large model
        )
    else:
        logger.error("Failed to initialize model. Exiting.")
