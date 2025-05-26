import torch
from transformers import pipeline
import scipy.io.wavfile

# --- Configuration ---
MODEL_NAME = "facebook/musicgen-small"
TEXT_PROMPT = "A calming lofi hip hop beat with a soft piano melody"
OUTPUT_FILENAME = "musicgen_pipeline_output.wav"
MAX_NEW_TOKENS = 1500 # ~30 seconds

# --- Device Setup ---
device_id = 0 if torch.cuda.is_available() else -1 # 0 for first GPU, -1 for CPU
print(f"Using device_id: {device_id} ({'GPU' if device_id != -1 else 'CPU'})")

# --- Create Pipeline ---
print(f"Creating text-to-audio pipeline with {MODEL_NAME}...")
# The pipeline handles model and processor loading internally
synthesiser = pipeline("text-to-audio", model=MODEL_NAME, device=device_id)
print("Pipeline created.")

# --- Generate Music ---
print("Generating music...")
# Pass generation parameters via forward_params
# Note: some parameters might have different names or behaviors in pipeline vs. direct model.generate
music_output = synthesiser(
    TEXT_PROMPT,
    forward_params={"do_sample": True, "max_new_tokens": MAX_NEW_TOKENS, "guidance_scale": 3.0}
)
print("Music generation complete.")

# --- Save Audio ---
waveform = music_output["audio"] # The audio data is a NumPy array
sampling_rate = music_output["sampling_rate"]

print(f"Saving audio to {OUTPUT_FILENAME} with sampling rate {sampling_rate}...")
scipy.io.wavfile.write(OUTPUT_FILENAME, rate=sampling_rate, data=waveform)
print(f"Successfully saved: {OUTPUT_FILENAME}")

# from IPython.display import Audio
# Audio(waveform, rate=sampling_rate)
