#!/usr/bin/env python3
"""Trim only the exterior near-white margin from the published Figure 2 panels."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "figures" / "original-extracts"
OUTPUT_DIR = ROOT / "assets" / "figures"
PADDING = 8
CONTENT_THRESHOLD = 210


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def crop_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    rgb = image.convert("RGB")
    mask = Image.new("L", rgb.size, 0)
    pixels = mask.load()
    source = rgb.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            if min(source[x, y]) < CONTENT_THRESHOLD:
                pixels[x, y] = 255
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("No visible chart content detected")
    left, top, right, bottom = bbox
    return (
        max(0, left - PADDING),
        max(0, top - PADDING),
        min(rgb.width, right + PADDING),
        min(rgb.height, bottom + PADDING),
    )


def main() -> None:
    manifest = {
        "operation": "exterior near-white margin crop only",
        "content_threshold": CONTENT_THRESHOLD,
        "padding_pixels": PADDING,
        "panels": [],
    }

    for source in sorted(SOURCE_DIR.glob("figure2-*.png")):
        destination = OUTPUT_DIR / f"{source.stem}-cropped.png"
        with Image.open(source) as image:
            image.load()
            bbox = crop_bounds(image)
            cropped = image.crop(bbox)
            cropped.save(destination, optimize=False)

            # Pixel equality proves that this is a rectangular crop, not a redraw.
            with Image.open(destination) as saved:
                saved.load()
                difference = ImageChops.difference(cropped.convert("RGBA"), saved.convert("RGBA"))
                if difference.getbbox() is not None:
                    raise ValueError(f"Pixel mismatch after saving {destination.name}")

            manifest["panels"].append(
                {
                    "source": str(source.relative_to(ROOT)),
                    "output": str(destination.relative_to(ROOT)),
                    "source_size": list(image.size),
                    "crop_box": list(bbox),
                    "output_size": list(cropped.size),
                    "source_sha256": sha256(source),
                    "output_sha256": sha256(destination),
                }
            )

    (OUTPUT_DIR / "figure2-crop-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
