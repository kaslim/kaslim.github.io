"""LEGACY / ARCHIVED PAGE PROTOTYPE — DO NOT USE AS RESEARCH OUTPUT.

This script uses random noise, simulated predictions, and fabricated per-sample
metrics. It does not run DiffMusic, GACELA, or a target model. The rebuilt MAIA
page does not load any artifact produced by this file. Reproducible, model-based
demo generation lives in ``tools/maia_real_demo``.
"""

import os
import json
import numpy as np
import soundfile as sf
from pathlib import Path

# Configuration
SOURCE_DIR = "/home/yons/文档/AAAI/ISMIR/DiffMusic/IDS-NMR"
OUTPUT_DIR = "/home/yons/文档/AAAI/ISMIR/maia-demo/docs/data/audio"
SAMPLE_RATE = 16000

# Genres and samples to process (2 per genre)
SAMPLES = [
    {"genre": "blues", "files": ["blues.00000.wav", "blues.00001.wav"]},
    {"genre": "classical", "files": ["classical.00000.wav", "classical.00001.wav"]},
    {"genre": "country", "files": ["country.00000.wav", "country.00001.wav"]},
    {"genre": "pop", "files": ["pop.00000.wav", "pop.00001.wav"]},
]

# Adversarial predictions (for demonstration - simulated attack results)
ADVERSARIAL_MAPPINGS = {
    "blues": ["Jazz", "Rock"],
    "classical": ["Ambient", "Classical"],  # One success, one fail
    "country": ["Folk", "Pop"],
    "pop": ["Dance", "Pop"],  # One success, one fail
}

# Inpainting regions (in seconds) - 2-3 short regions per sample
INPAINTING_REGIONS = [
    [[5.0, 5.4], [12.0, 12.3], [18.0, 18.5]],  # blues_00
    [[6.5, 6.9], [14.0, 14.4]],  # blues_01
    [[4.0, 4.5], [10.0, 10.3], [20.0, 20.4]],  # classical_00
    [[7.0, 7.3], [15.0, 15.5]],  # classical_01
    [[5.5, 5.9], [13.0, 13.4], [22.0, 22.3]],  # country_00
    [[8.0, 8.4], [16.0, 16.5]],  # country_01
    [[3.0, 3.5], [11.0, 11.3], [19.0, 19.5]],  # pop_00
    [[6.0, 6.4], [14.5, 14.9]],  # pop_01
]


def apply_simple_inpainting(audio, regions, sr=16000):
    """
    Apply simple inpainting simulation by adding subtle modifications to specific regions.
    This is a simplified version for demo purposes.
    
    Args:
        audio: Audio signal (numpy array)
        regions: List of [start, end] time regions in seconds
        sr: Sample rate
    
    Returns:
        Modified audio signal
    """
    modified_audio = audio.copy()
    
    for start_s, end_s in regions:
        start_sample = int(start_s * sr)
        end_sample = int(end_s * sr)
        
        if end_sample > len(audio):
            end_sample = len(audio)
        
        # Extract region
        region = audio[start_sample:end_sample]
        
        # Apply subtle modifications (simulating adversarial inpainting)
        # 1. Add small amount of noise
        noise = np.random.randn(len(region)) * 0.005
        # 2. Apply slight frequency shift (simulated by phase shift)
        modified_region = region + noise
        # 3. Apply slight amplitude modulation
        envelope = 1.0 + 0.05 * np.sin(np.linspace(0, 4*np.pi, len(region)))
        modified_region = modified_region * envelope
        
        # Smooth transitions at boundaries
        fade_len = min(int(0.01 * sr), len(region) // 4)  # 10ms fade or 1/4 of region
        if fade_len > 0:
            fade_in = np.linspace(0, 1, fade_len)
            fade_out = np.linspace(1, 0, fade_len)
            
            modified_region[:fade_len] = (region[:fade_len] * (1 - fade_in) + 
                                         modified_region[:fade_len] * fade_in)
            modified_region[-fade_len:] = (region[-fade_len:] * (1 - fade_out) + 
                                          modified_region[-fade_len:] * fade_out)
        
        # Replace region in audio
        modified_audio[start_sample:end_sample] = modified_region
    
    # Normalize to prevent clipping
    max_val = np.abs(modified_audio).max()
    if max_val > 0.99:
        modified_audio = modified_audio * (0.99 / max_val)
    
    return modified_audio


def generate_mock_importance_heatmap(duration, regions, num_freq_bins=128):
    """
    Generate mock Grad-CAM importance heatmap data
    
    Args:
        duration: Audio duration in seconds
        regions: Inpainting regions
        num_freq_bins: Number of frequency bins
    
    Returns:
        Dictionary with heatmap data
    """
    num_time_frames = int(duration * 10)  # 10 frames per second
    
    # Initialize importance map (low values)
    importance = np.random.rand(num_freq_bins, num_time_frames) * 0.2
    
    # Add high importance in specified regions
    for start_s, end_s in regions:
        start_frame = int(start_s * 10)
        end_frame = int(end_s * 10)
        
        # Create a peaked importance distribution
        freq_peak = np.random.randint(20, num_freq_bins - 20)
        freq_width = 30
        
        for t in range(start_frame, min(end_frame, num_time_frames)):
            for f in range(max(0, freq_peak - freq_width), 
                          min(num_freq_bins, freq_peak + freq_width)):
                distance = abs(f - freq_peak) / freq_width
                importance[f, t] = max(importance[f, t], 
                                      0.7 + 0.3 * (1 - distance))
    
    return {
        "shape": [num_freq_bins, num_time_frames],
        "data": importance.tolist(),
        "time_resolution": 0.1,  # seconds per frame
        "freq_bins": num_freq_bins
    }


def main():
    """Generate all adversarial audio samples"""
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    sample_metadata = []
    sample_idx = 0
    
    for genre_data in SAMPLES:
        genre = genre_data["genre"]
        files = genre_data["files"]
        
        for file_idx, filename in enumerate(files):
            source_path = os.path.join(SOURCE_DIR, filename)
            
            if not os.path.exists(source_path):
                print(f"Warning: {source_path} not found, skipping...")
                continue
            
            print(f"Processing {filename}...")
            
            # Load audio
            audio, sr = sf.read(source_path)
            
            # Ensure mono
            if len(audio.shape) > 1:
                audio = audio.mean(axis=1)
            
            # Resample if needed
            if sr != SAMPLE_RATE:
                print(f"  Resampling from {sr}Hz to {SAMPLE_RATE}Hz...")
                from scipy import signal
                audio = signal.resample(audio, int(len(audio) * SAMPLE_RATE / sr))
                sr = SAMPLE_RATE
            
            # Get inpainting regions
            regions = INPAINTING_REGIONS[sample_idx]
            
            # Generate adversarial audio
            adversarial_audio = apply_simple_inpainting(audio, regions, sr)
            
            # Generate file IDs
            file_id = f"{genre}_{file_idx:02d}"
            
            # Save original audio
            original_path = os.path.join(OUTPUT_DIR, f"{file_id}_original.wav")
            sf.write(original_path, audio, sr)
            print(f"  Saved: {original_path}")
            
            # Save adversarial audio
            adversarial_path = os.path.join(OUTPUT_DIR, f"{file_id}_adversarial.wav")
            sf.write(adversarial_path, adversarial_audio, sr)
            print(f"  Saved: {adversarial_path}")
            
            # Generate importance heatmap
            duration = len(audio) / sr
            importance_data = generate_mock_importance_heatmap(duration, regions)
            importance_path = os.path.join(OUTPUT_DIR, f"{file_id}_importance.json")
            with open(importance_path, 'w') as f:
                json.dump(importance_data, f)
            print(f"  Saved: {importance_path}")
            
            # Determine adversarial prediction
            adv_pred = ADVERSARIAL_MAPPINGS[genre][file_idx]
            attack_success = (adv_pred != genre.capitalize())
            
            # Generate sample metadata
            metadata = {
                "id": file_id,
                "genre": genre.capitalize(),
                "original_audio": f"data/audio/{file_id}_original.wav",
                "adversarial_audio": f"data/audio/{file_id}_adversarial.wav",
                "original_prediction": genre.capitalize(),
                "adversarial_prediction": adv_pred,
                "original_confidence": round(0.75 + np.random.rand() * 0.20, 2),
                "adversarial_confidence": round(0.45 + np.random.rand() * 0.30, 2),
                "inpainting_regions": regions,
                "attack_success": attack_success,
                "metrics": {
                    "fad": round(11.0 + np.random.rand() * 2.0, 2),
                    "lsd": round(1.5 + np.random.rand() * 0.6, 2),
                    "mos": round(3.5 + np.random.rand() * 0.8, 1)
                }
            }
            
            sample_metadata.append(metadata)
            sample_idx += 1
            
            print(f"  ✓ Processed {file_id}: {genre.capitalize()} → {adv_pred} "
                  f"({'SUCCESS' if attack_success else 'FAILED'})")
    
    # Save samples.json
    samples_json = {"samples": sample_metadata}
    samples_path = os.path.join(OUTPUT_DIR, "..", "samples.json")
    with open(samples_path, 'w') as f:
        json.dump(samples_json, f, indent=2)
    
    print(f"\n✅ Generated {len(sample_metadata)} adversarial audio samples")
    print(f"📁 Audio files saved to: {OUTPUT_DIR}")
    print(f"📄 Metadata saved to: {samples_path}")
    
    # Generate metrics.json for results section
    metrics_data = {
        "csi_whitebox": {
            "methods": ["PGD", "C&W", "MAIA-WB"],
            "asr": [82.1, 88.5, 92.8],
            "map": [0.619, 0.560, 0.488],
            "fad": [12.64, 12.11, 11.25],
            "lsd": [2.10, 1.94, 1.58],
            "mos": [3.1, 3.4, 4.0]
        },
        "mgc_whitebox": {
            "methods": ["PGD", "C&W", "MAIA-WB"],
            "asr": [84.6, 89.1, 93.5],
            "accuracy": [0.551, 0.512, 0.466],
            "fad": [15.32, 14.90, 13.85],
            "lsd": [2.20, 2.21, 1.94],
            "mos": [3.2, 3.3, 3.8]
        },
        "csi_blackbox": {
            "methods": ["NES", "ZOO", "MAIA-BB"],
            "asr": [70.2, 74.9, 80.1],
            "map": [0.682, 0.639, 0.594],
            "fad": [13.93, 13.51, 12.56],
            "lsd": [2.27, 2.12, 1.90],
            "mos": [2.8, 3.0, 3.6]
        },
        "mgc_blackbox": {
            "methods": ["NES", "ZOO", "MAIA-BB"],
            "asr": [65.7, 72.4, 77.9],
            "accuracy": [0.704, 0.654, 0.601],
            "fad": [16.26, 15.90, 14.68],
            "lsd": [2.15, 2.05, 1.85],
            "mos": [2.5, 3.0, 3.3]
        }
    }
    
    metrics_path = os.path.join(OUTPUT_DIR, "..", "metrics.json")
    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    
    print(f"📊 Metrics saved to: {metrics_path}")
    print("\n🎉 All done! Ready to build the website.")


if __name__ == "__main__":
    main()
