#!/usr/bin/env python3
"""Convert the private run record into a browser-safe, traceable manifest."""

from __future__ import annotations

import json
from pathlib import Path

from config import (
    AUDIO_OUTPUT,
    CHECKPOINT_ARCHIVE_MD5,
    CROSSFADE_SECONDS,
    GENERATION_DATE,
    MANIFEST_OUTPUT,
    REPOSITORY_ROOT,
    RUN_RECORD,
    SAMPLE_ID,
    SAMPLE_RATE,
    SOURCE_ATTRIBUTION,
    SOURCE_LICENSE,
    SOURCE_PAGE,
)


def relative(path: str | Path) -> str:
    return str(Path(path).resolve().relative_to(REPOSITORY_ROOT.resolve() / "maia"))


def main() -> None:
    record = json.loads(RUN_RECORD.read_text(encoding="utf-8"))
    candidates = []
    for item in record["candidates"]:
        seed = item["random_seed"]
        candidates.append(
            {
                "random_seed": seed,
                "region_seeds": item["region_seeds"],
                "regenerated_audio": relative(item["audio"]),
                "output_hash": item["sha256"],
                "regenerated_spectrogram": relative(record["spectrogram_assets"][f"seed-{seed}"]["path"]),
                "difference_spectrogram": relative(record["spectrogram_assets"][f"seed-{seed}-difference"]["path"]),
                "diagnostics": {
                    "peak": item["peak"],
                    "rms_difference_db": item["rms_difference_db"],
                    "mean_boundary_jump": item["mean_boundary_jump"],
                    "outside_max_abs_difference": item["outside_max_abs_difference"],
                },
            }
        )

    manifest = {
        "schema_version": 1,
        "demo_scope": "real-model-inpainting-component-only",
        "target_model_evaluated": False,
        "samples": [
            {
                "sample_id": SAMPLE_ID,
                "display_name": "Goldberg Variation 20 — 30 s excerpt",
                "source_audio": SOURCE_PAGE,
                "source_attribution": SOURCE_ATTRIBUTION,
                "source_license": SOURCE_LICENSE,
                "original_audio": relative(AUDIO_OUTPUT / f"{SAMPLE_ID}_original.wav"),
                "masked_audio": relative(AUDIO_OUTPUT / f"{SAMPLE_ID}_masked.wav"),
                "original_spectrogram": relative(record["spectrogram_assets"]["original"]["path"]),
                "masked_spectrogram": relative(record["spectrogram_assets"]["masked"]["path"]),
                "original_region_seconds": record["original_region_seconds"],
                "effective_regions": record["effective_regions"],
                "crossfade_seconds": CROSSFADE_SECONDS,
                "model_name": record["model_name"],
                "model_repository": record["model_repository"],
                "checkpoint_name": record["checkpoint_name"],
                "checkpoint_hash": record["checkpoint_sha256"],
                "checkpoint_archive_md5": CHECKPOINT_ARCHIVE_MD5,
                "code_commit": record["model_code_commit"],
                "sample_rate": SAMPLE_RATE,
                "input_hash": record["original_sha256"],
                "masked_hash": record["masked_sha256"],
                "generation_date": GENERATION_DATE,
                "target_model_evaluated": False,
                "selected_seed": record["selected_seed"],
                "selection_rule": record["selection_rule"],
                "candidates": candidates,
                "inference_verification": {
                    "checkpoint_loaded": record["checkpoint_loaded"],
                    "loaded_parameter_count": record["loaded_parameter_count"],
                    "loaded_parameter_abs_sum": record["loaded_parameter_abs_sum"],
                    "torch_version": record["torch_version"],
                },
                "notes": (
                    "The fixed interval centers come from the legacy MAIA page metadata. "
                    "They were aligned to the GACELA maestro-short 32-frame gap. "
                    "No target classifier or retrieval model was run for this interactive sample."
                ),
            }
        ],
    }
    MANIFEST_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_OUTPUT.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
