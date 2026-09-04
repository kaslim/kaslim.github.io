#!/usr/bin/env python3
"""Extract TS-RaMIA paper figures without redrawing or altering their content.

Figure 1 is an embedded raster image. Figure 2 is vector artwork, so this script
renders its source page at 240 dpi and crops the published figure region only.
The page render is preserved under assets/figures/original-extracts.
"""

from __future__ import annotations

import argparse
import hashlib
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image


FIGURE2_BOX_240_DPI = (300, 1055, 1760, 1470)
FIGURE2D_BOX_240_DPI = (1408, 1055, 1760, 1470)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--poppler-bin", required=True, type=Path)
    parser.add_argument("--output", default=Path(__file__).resolve().parents[1] / "assets" / "figures", type=Path)
    args = parser.parse_args()

    output = args.output.resolve()
    originals = output / "original-extracts"
    output.mkdir(parents=True, exist_ok=True)
    originals.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="ts-ramia-figures-") as tmp:
        tmpdir = Path(tmp)
        run([str(args.poppler_bin / "pdfimages"), "-f", "4", "-l", "4", "-png", str(args.pdf), str(tmpdir / "figure1")])
        figure1 = tmpdir / "figure1-000.png"
        shutil.copy2(figure1, originals / "figure1-embedded-original.png")
        shutil.copy2(figure1, output / "figure1-pipeline.png")

        page_prefix = tmpdir / "figure2-page"
        run([
            str(args.poppler_bin / "pdftoppm"), "-f", "9", "-l", "9", "-singlefile",
            "-png", "-r", "240", str(args.pdf), str(page_prefix)
        ])
        page = Path(f"{page_prefix}.png")
        shutil.copy2(page, originals / "figure2-page-240dpi.png")
        source = Image.open(page)
        source.crop(FIGURE2_BOX_240_DPI).save(output / "figure2-combined-cropped.png")
        source.crop(FIGURE2D_BOX_240_DPI).save(output / "figure2d-checkpoint-cropped.png")

    for asset in sorted(output.rglob("*.png")):
        print(f"{asset.relative_to(output)}  sha256={sha256(asset)}")


if __name__ == "__main__":
    main()
