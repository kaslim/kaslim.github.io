#!/usr/bin/env python3
"""Download the licensed source recording and prepare deterministic demo input."""

from __future__ import annotations

import hashlib
import json
import shutil
import urllib.request

import librosa
import numpy as np
import soundfile as sf

from config import (
    AUDIO_OUTPUT,
    CROSSFADE_SECONDS,
    EXCERPT_DURATION_SECONDS,
    EXCERPT_START_SECONDS,
    GAP_FRAMES,
    HOP_LENGTH,
    LEGACY_REGIONS_SECONDS,
    RUN_RECORD,
    SAMPLE_ID,
    SAMPLE_RATE,
    SOURCE_CACHE,
    SOURCE_SHA1,
    SOURCE_URL,
)
from compose_audio import effective_regions, mask_regions


def digest(path, algorithm: str) -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def ensure_source() -> None:
    SOURCE_CACHE.parent.mkdir(parents=True, exist_ok=True)
    if not SOURCE_CACHE.exists() or digest(SOURCE_CACHE, "sha1") != SOURCE_SHA1:
        request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "MAIA-repro/1.0"})
        with urllib.request.urlopen(request, timeout=180) as source, SOURCE_CACHE.open("wb") as sink:
            shutil.copyfileobj(source, sink)
    source_sha = digest(SOURCE_CACHE, "sha1")
    if source_sha != SOURCE_SHA1:
        raise RuntimeError(f"Source recording checksum mismatch: {source_sha}")


def main() -> None:
    ensure_source()
    AUDIO_OUTPUT.mkdir(parents=True, exist_ok=True)
    RUN_RECORD.parent.mkdir(parents=True, exist_ok=True)

    audio, _ = librosa.load(SOURCE_CACHE, sr=SAMPLE_RATE, mono=True, dtype=np.float64)
    start = round(EXCERPT_START_SECONDS * SAMPLE_RATE)
    length = round(EXCERPT_DURATION_SECONDS * SAMPLE_RATE)
    excerpt = audio[start : start + length]
    if len(excerpt) != length:
        raise RuntimeError("The source recording is shorter than the requested excerpt")

    regions = effective_regions(
        LEGACY_REGIONS_SECONDS,
        sample_rate=SAMPLE_RATE,
        hop_length=HOP_LENGTH,
        gap_frames=GAP_FRAMES,
    )
    masked = mask_regions(excerpt, regions, SAMPLE_RATE, CROSSFADE_SECONDS)

    original_path = AUDIO_OUTPUT / f"{SAMPLE_ID}_original.wav"
    masked_path = AUDIO_OUTPUT / f"{SAMPLE_ID}_masked.wav"
    sf.write(original_path, excerpt, SAMPLE_RATE, subtype="PCM_16")
    sf.write(masked_path, masked, SAMPLE_RATE, subtype="PCM_16")

    record = {
        "sample_id": SAMPLE_ID,
        "source_cache": str(SOURCE_CACHE),
        "source_sha1": SOURCE_SHA1,
        "original_audio": str(original_path),
        "masked_audio": str(masked_path),
        "original_region_seconds": LEGACY_REGIONS_SECONDS,
        "effective_regions": regions,
        "sample_rate": SAMPLE_RATE,
        "length_samples": len(excerpt),
        "original_sha256": digest(original_path, "sha256"),
        "masked_sha256": digest(masked_path, "sha256"),
    }
    RUN_RECORD.write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
