#!/usr/bin/env python3
"""Generate spectrogram images directly from the verified WAV artifacts."""

from __future__ import annotations

import hashlib
import json

import librosa
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import soundfile as sf

from config import AUDIO_OUTPUT, FFT_LENGTH, HOP_LENGTH, RUN_RECORD, SAMPLE_ID, SAMPLE_RATE, SPECTROGRAM_OUTPUT


def sha256(path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def db_spectrogram(audio):
    magnitude = np.abs(librosa.stft(audio, n_fft=FFT_LENGTH, hop_length=HOP_LENGTH, center=False))
    return librosa.amplitude_to_db(magnitude, ref=np.max)


def render(matrix, path, cmap="magma", vmin=-80, vmax=0):
    fig, axis = plt.subplots(figsize=(14, 4), dpi=140)
    axis.imshow(matrix, origin="lower", aspect="auto", cmap=cmap, vmin=vmin, vmax=vmax)
    axis.set_axis_off()
    fig.subplots_adjust(left=0, right=1, bottom=0, top=1)
    fig.savefig(path, bbox_inches="tight", pad_inches=0)
    plt.close(fig)


def main() -> None:
    record = json.loads(RUN_RECORD.read_text(encoding="utf-8"))
    SPECTROGRAM_OUTPUT.mkdir(parents=True, exist_ok=True)
    assets = {}

    audio_paths = {
        "original": AUDIO_OUTPUT / f"{SAMPLE_ID}_original.wav",
        "masked": AUDIO_OUTPUT / f"{SAMPLE_ID}_masked.wav",
    }
    for candidate in record["candidates"]:
        audio_paths[f"seed-{candidate['random_seed']}"] = AUDIO_OUTPUT / f"{SAMPLE_ID}_regenerated_seed-{candidate['random_seed']}.wav"

    spectra = {}
    for label, audio_path in audio_paths.items():
        audio, sr = sf.read(audio_path, dtype="float64")
        if sr != SAMPLE_RATE:
            raise RuntimeError(f"Unexpected sample rate for {audio_path}")
        spectrum = db_spectrogram(audio)
        spectra[label] = spectrum
        image_path = SPECTROGRAM_OUTPUT / f"{SAMPLE_ID}_{label}.png"
        render(spectrum, image_path)
        assets[label] = {"path": str(image_path), "sha256": sha256(image_path)}

    for candidate in record["candidates"]:
        label = f"seed-{candidate['random_seed']}"
        difference = np.abs(spectra[label] - spectra["original"])
        image_path = SPECTROGRAM_OUTPUT / f"{SAMPLE_ID}_{label}_difference.png"
        render(difference, image_path, cmap="viridis", vmin=0, vmax=max(12, float(np.percentile(difference, 99.5))))
        assets[f"{label}-difference"] = {"path": str(image_path), "sha256": sha256(image_path)}

    record["spectrogram_assets"] = assets
    RUN_RECORD.write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(json.dumps(assets, indent=2))


if __name__ == "__main__":
    main()
