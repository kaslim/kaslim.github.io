"""Region alignment, masking, crossfading, and candidate quality checks."""

from __future__ import annotations

import math

import numpy as np


def effective_regions(regions, sample_rate: int, hop_length: int, gap_frames: int):
    aligned = []
    for original_start, original_end in regions:
        center = (original_start + original_end) / 2
        center_frame = round(center * sample_rate / hop_length)
        start_frame = center_frame - gap_frames // 2
        end_frame = start_frame + gap_frames
        effective_start = start_frame * hop_length / sample_rate
        effective_end = end_frame * hop_length / sample_rate
        aligned.append(
            {
                "original": [original_start, original_end],
                "effective": [effective_start, effective_end],
                "start_frame": start_frame,
                "end_frame": end_frame,
                "center_shift_seconds": ((effective_start + effective_end) / 2) - center,
                "alignment_reason": (
                    f"GACELA maestro-short requires a fixed {gap_frames}-frame gap; "
                    "the interval was aligned around the preserved legacy center."
                ),
            }
        )
    return aligned


def _fade_samples(sample_rate: int, crossfade_seconds: float, region_length: int) -> int:
    return max(1, min(round(sample_rate * crossfade_seconds), region_length // 2))


def mask_regions(audio, regions, sample_rate: int, crossfade_seconds: float):
    masked = np.asarray(audio, dtype=np.float64).copy()
    for region in regions:
        start = round(region["effective"][0] * sample_rate)
        end = round(region["effective"][1] * sample_rate)
        n = end - start
        fade = _fade_samples(sample_rate, crossfade_seconds, n)
        masked[start:end] = 0.0
        masked[start : start + fade] = audio[start : start + fade] * np.linspace(1, 0, fade)
        masked[end - fade : end] = audio[end - fade : end] * np.linspace(0, 1, fade)
    return masked


def blend_generated_region(audio, generated_gap, start: int, end: int, sample_rate: int, crossfade_seconds: float):
    output = np.asarray(audio, dtype=np.float64).copy()
    gap = np.asarray(generated_gap, dtype=np.float64)
    expected = end - start
    if len(gap) < expected:
        gap = np.pad(gap, (0, expected - len(gap)))
    gap = gap[:expected]
    fade = _fade_samples(sample_rate, crossfade_seconds, expected)
    weight = np.ones(expected, dtype=np.float64)
    weight[:fade] = np.linspace(0, 1, fade)
    weight[-fade:] = np.minimum(weight[-fade:], np.linspace(1, 0, fade))
    output[start:end] = audio[start:end] * (1 - weight) + gap * weight
    return output


def candidate_diagnostics(original, candidate, regions, sample_rate: int):
    original = np.asarray(original, dtype=np.float64)
    candidate = np.asarray(candidate, dtype=np.float64)
    boundary_jumps = []
    changed = np.zeros(len(original), dtype=bool)
    for region in regions:
        start = round(region["effective"][0] * sample_rate)
        end = round(region["effective"][1] * sample_rate)
        changed[start:end] = True
        if start > 0:
            boundary_jumps.append(abs(candidate[start] - candidate[start - 1]))
        if end < len(candidate):
            boundary_jumps.append(abs(candidate[end] - candidate[end - 1]))
    outside_max_abs_difference = float(np.max(np.abs(candidate[~changed] - original[~changed])))
    original_rms = float(math.sqrt(np.mean(original**2)))
    candidate_rms = float(math.sqrt(np.mean(candidate**2)))
    return {
        "peak": float(np.max(np.abs(candidate))),
        "rms": candidate_rms,
        "rms_difference_db": float(20 * math.log10(max(candidate_rms, 1e-12) / max(original_rms, 1e-12))),
        "mean_boundary_jump": float(np.mean(boundary_jumps)),
        "outside_max_abs_difference": outside_max_abs_difference,
        "has_nan": bool(np.isnan(candidate).any()),
        "is_silent": bool(candidate_rms < 1e-5),
    }
