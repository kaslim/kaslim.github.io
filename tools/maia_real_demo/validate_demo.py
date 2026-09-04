#!/usr/bin/env python3
"""Validate manifest, audio, spectrogram, hashes, and unchanged regions."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import soundfile as sf

from config import MANIFEST_OUTPUT, REPOSITORY_ROOT


def sha256(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def resolve(relative: str) -> Path:
    return REPOSITORY_ROOT / "maia" / relative


def main() -> None:
    manifest = json.loads(MANIFEST_OUTPUT.read_text(encoding="utf-8"))
    checks = []
    for sample in manifest["samples"]:
        required = [
            "model_name",
            "checkpoint_name",
            "checkpoint_hash",
            "code_commit",
            "selected_seed",
            "source_license",
        ]
        for field in required:
            if sample.get(field) in (None, ""):
                raise AssertionError(f"Missing required field: {field}")

        original_path = resolve(sample["original_audio"])
        masked_path = resolve(sample["masked_audio"])
        original, sample_rate = sf.read(original_path, dtype="float64")
        masked, masked_rate = sf.read(masked_path, dtype="float64")
        if sample_rate != sample["sample_rate"] or masked_rate != sample_rate:
            raise AssertionError("Sample-rate mismatch")
        if len(original) != len(masked):
            raise AssertionError("Original/masked length mismatch")
        if sha256(original_path) != sample["input_hash"] or sha256(masked_path) != sample["masked_hash"]:
            raise AssertionError("Original or masked hash mismatch")

        changed = np.zeros(len(original), dtype=bool)
        for region in sample["effective_regions"]:
            start = round(region["effective"][0] * sample_rate)
            end = round(region["effective"][1] * sample_rate)
            if not 0 <= start < end <= len(original):
                raise AssertionError("Region outside audio bounds")
            changed[start:end] = True

        for image_field in ["original_spectrogram", "masked_spectrogram"]:
            image_path = resolve(sample[image_field])
            if not image_path.exists() or image_path.stat().st_size == 0:
                raise AssertionError(f"Missing spectrogram: {image_path}")

        for candidate in sample["candidates"]:
            path = resolve(candidate["regenerated_audio"])
            generated, generated_rate = sf.read(path, dtype="float64")
            if generated_rate != sample_rate or len(generated) != len(original):
                raise AssertionError("Generated audio length/sample-rate mismatch")
            if sha256(path) != candidate["output_hash"]:
                raise AssertionError("Generated audio hash mismatch")
            if np.isnan(generated).any() or np.max(np.abs(generated)) >= 1.0:
                raise AssertionError("Generated audio contains NaN or clipping")
            if np.sqrt(np.mean(generated**2)) < 1e-5:
                raise AssertionError("Generated audio is silent")
            outside = np.max(np.abs(generated[~changed] - original[~changed]))
            if outside > 1 / 32768 + 1e-12:
                raise AssertionError(f"Unexpected change outside selected regions: {outside}")
            for image_field in ["regenerated_spectrogram", "difference_spectrogram"]:
                image_path = resolve(candidate[image_field])
                if not image_path.exists() or image_path.stat().st_size == 0:
                    raise AssertionError(f"Missing spectrogram: {image_path}")
            checks.append(
                {
                    "sample": sample["sample_id"],
                    "seed": candidate["random_seed"],
                    "length_samples": len(generated),
                    "outside_max_abs_difference": float(outside),
                    "peak": float(np.max(np.abs(generated))),
                }
            )

    if manifest.get("target_model_evaluated") is not False:
        raise AssertionError("This manifest must not claim target-model evaluation")
    print(json.dumps({"status": "passed", "checks": checks}, indent=2))


if __name__ == "__main__":
    main()
