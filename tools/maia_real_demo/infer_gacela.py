#!/usr/bin/env python3
"""Run the official GACELA maestro-short weights with a minimal PyTorch 2 port."""

from __future__ import annotations

import hashlib
import json
import sys

import librosa
import numpy as np
import soundfile as sf
import torch
from tifresi.stft import GaussTruncTF
from tifresi.transforms import inv_log_spectrogram, log_spectrogram

from compose_audio import blend_generated_region, candidate_diagnostics
from config import (
    AUDIO_OUTPUT,
    CANDIDATE_SEEDS,
    CHECKPOINT,
    CHECKPOINT_SHA256,
    CROSSFADE_SECONDS,
    FFT_LENGTH,
    GACELA_COMMIT,
    GACELA_SOURCE,
    GAP_FRAMES,
    HOP_LENGTH,
    LEFT_CONTEXT_FRAMES,
    RIGHT_CONTEXT_FRAMES,
    RUN_RECORD,
    SAMPLE_ID,
    SAMPLE_RATE,
)


def sha256(path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(block)
    return hasher.hexdigest()


def model_params():
    md = 32
    generator = {
        "stride": [2, 2, 2, 2, 2],
        "nfilter": [8 * md, 4 * md, 2 * md, md, 1],
        "shape": [[4, 4], [4, 4], [8, 8], [8, 8], [8, 8]],
        "padding": [[1, 1], [1, 1], [3, 3], [3, 3], [3, 3]],
        "residual_blocks": 2,
        "full": 256 * md,
        "summary": True,
        "data_size": 2,
        "in_conv_shape": [16, 1],
    }
    border = {
        "nfilter": [md, 2 * md, md, md // 2],
        "shape": [[5, 5], [5, 5], [5, 5], [5, 5]],
        "stride": [2, 2, 2, 2],
        "data_size": 2,
        "border_scale": 1,
        "width_full": None,
    }
    generator["borders"] = border
    return generator, border


def time_average(matrix: torch.Tensor, reduction: int) -> torch.Tensor:
    usable = matrix.shape[-1] - (matrix.shape[-1] % reduction)
    matrix = matrix[..., :usable]
    shape = (*matrix.shape[:-1], usable // reduction, reduction)
    return matrix.reshape(shape).mean(dim=-1)


class GacelaShort:
    def __init__(self):
        sys.path.insert(0, str(GACELA_SOURCE))
        from model.borderEncoder import BorderEncoder
        from model.generator import Generator

        generator_params, border_params = model_params()
        self.encoders = [BorderEncoder(border_params), BorderEncoder(border_params)]
        self.generator = Generator(generator_params, 720)
        checkpoint = torch.load(CHECKPOINT, map_location="cpu")
        self.generator.load_state_dict(checkpoint["generator"], strict=True)
        for encoder, state in zip(self.encoders, checkpoint["encoders"]):
            encoder.load_state_dict(state, strict=True)
        self.generator.eval()
        for encoder in self.encoders:
            encoder.eval()

        mel = librosa.filters.mel(sr=SAMPLE_RATE, n_fft=FFT_LENGTH, n_mels=80, fmin=0, fmax=None)
        self.mel_basis = torch.from_numpy(mel[:, :-1]).float().reshape(1, 1, 80, 512)
        self.stft = GaussTruncTF(HOP_LENGTH, FFT_LENGTH)
        self.parameter_count = sum(p.numel() for p in self.generator.parameters()) + sum(
            p.numel() for encoder in self.encoders for p in encoder.parameters()
        )
        self.parameter_abs_sum = float(
            sum(p.detach().abs().sum().item() for p in self.generator.parameters())
            + sum(p.detach().abs().sum().item() for encoder in self.encoders for p in encoder.parameters())
        )

    def _mel(self, spectrogram: torch.Tensor, dynamic_range_db: float = 50.0):
        linear = torch.pow(10.0, 25.0 * (spectrogram - 1.0) / 10.0)
        mel = torch.matmul(self.mel_basis[: spectrogram.shape[0]], linear)
        mel = torch.abs(mel)
        minimum = torch.max(mel) / (10 ** (dynamic_range_db / 10))
        log_mel = 10 * torch.log10(torch.clamp(mel, min=minimum.item()))
        return log_mel / (dynamic_range_db / 2) + 1

    def generate_gap(self, context_audio: np.ndarray, seed: int) -> np.ndarray:
        expected = (LEFT_CONTEXT_FRAMES + GAP_FRAMES + RIGHT_CONTEXT_FRAMES) * HOP_LENGTH
        if len(context_audio) != expected:
            raise ValueError(f"Expected {expected} context samples, got {len(context_audio)}")

        spectrogram = self.stft.spectrogram(context_audio)
        normalized = log_spectrogram(spectrogram, dynamic_range_dB=50) / 25 + 1
        normalized = normalized[:-1, : LEFT_CONTEXT_FRAMES + GAP_FRAMES + RIGHT_CONTEXT_FRAMES]
        tensor = torch.from_numpy(normalized).float().reshape(1, 1, 512, -1)
        left = tensor[..., :LEFT_CONTEXT_FRAMES]
        right = tensor[..., LEFT_CONTEXT_FRAMES + GAP_FRAMES :]

        with torch.no_grad():
            encoded = [
                encoder(time_average(self._mel(border), 4))
                for encoder, border in zip(self.encoders, [left, right])
            ]
            torch.manual_seed(seed)
            shape = encoded[0].shape
            noise = torch.rand(shape[0], 4, shape[2], shape[3])
            generated = self.generator(torch.cat((*encoded, noise), dim=1))
            complete = torch.cat((left, generated, right), dim=-1)

        magnitude = inv_log_spectrogram((complete[0, 0].cpu().numpy() - 1) * 25)
        magnitude = np.concatenate((magnitude, np.full((1, magnitude.shape[1]), magnitude.min())), axis=0)
        reconstructed = self.stft.invert_spectrogram(magnitude)
        start = LEFT_CONTEXT_FRAMES * HOP_LENGTH
        end = (LEFT_CONTEXT_FRAMES + GAP_FRAMES) * HOP_LENGTH
        return np.asarray(reconstructed[start:end], dtype=np.float64)


def main() -> None:
    if sha256(CHECKPOINT) != CHECKPOINT_SHA256:
        raise RuntimeError("Checkpoint SHA-256 does not match the audited value")
    record = json.loads(RUN_RECORD.read_text(encoding="utf-8"))
    original_path = AUDIO_OUTPUT / f"{SAMPLE_ID}_original.wav"
    original, sr = sf.read(original_path, dtype="float64")
    if sr != SAMPLE_RATE:
        raise RuntimeError(f"Unexpected input sample rate: {sr}")

    model = GacelaShort()
    candidates = []
    for base_seed in CANDIDATE_SEEDS:
        candidate = original.copy()
        region_seeds = []
        for region_index, region in enumerate(record["effective_regions"]):
            start_frame = region["start_frame"]
            context_start_frame = start_frame - LEFT_CONTEXT_FRAMES
            context_end_frame = start_frame + GAP_FRAMES + RIGHT_CONTEXT_FRAMES
            if context_start_frame < 0 or context_end_frame * HOP_LENGTH > len(original):
                raise RuntimeError("A selected region does not have enough model context")
            context = original[context_start_frame * HOP_LENGTH : context_end_frame * HOP_LENGTH]
            region_seed = base_seed + region_index
            region_seeds.append(region_seed)
            generated_gap = model.generate_gap(context, region_seed)
            start = start_frame * HOP_LENGTH
            end = (start_frame + GAP_FRAMES) * HOP_LENGTH
            candidate = blend_generated_region(
                candidate,
                generated_gap,
                start,
                end,
                SAMPLE_RATE,
                CROSSFADE_SECONDS,
            )

        output_path = AUDIO_OUTPUT / f"{SAMPLE_ID}_regenerated_seed-{base_seed}.wav"
        sf.write(output_path, candidate, SAMPLE_RATE, subtype="PCM_16")
        saved, _ = sf.read(output_path, dtype="float64")
        diagnostics = candidate_diagnostics(original, saved, record["effective_regions"], SAMPLE_RATE)
        diagnostics.update(
            {
                "random_seed": base_seed,
                "region_seeds": region_seeds,
                "audio": str(output_path),
                "sha256": sha256(output_path),
            }
        )
        candidates.append(diagnostics)

    valid = [c for c in candidates if not c["has_nan"] and not c["is_silent"] and c["peak"] < 0.999]
    if not valid:
        raise RuntimeError("No candidate passed the safety checks")
    selected = min(valid, key=lambda item: (item["mean_boundary_jump"], abs(item["rms_difference_db"])))
    record.update(
        {
            "model_name": "GACELA maestro-short (375 ms gap)",
            "model_repository": "https://github.com/andimarafioti/GACELA",
            "model_code_commit": GACELA_COMMIT,
            "checkpoint_name": CHECKPOINT.name,
            "checkpoint_sha256": CHECKPOINT_SHA256,
            "checkpoint_loaded": True,
            "loaded_parameter_count": model.parameter_count,
            "loaded_parameter_abs_sum": model.parameter_abs_sum,
            "torch_version": torch.__version__,
            "candidates": candidates,
            "selected_seed": selected["random_seed"],
            "selection_rule": (
                "Among candidates without NaN, silence, or clipping, select the lowest mean boundary jump; "
                "use absolute RMS difference as a tiebreaker."
            ),
        }
    )
    RUN_RECORD.write_text(json.dumps(record, indent=2), encoding="utf-8")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
