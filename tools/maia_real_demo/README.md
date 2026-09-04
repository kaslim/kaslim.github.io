# Reproducible GACELA component demo

This isolated pipeline replaces the legacy random-noise prototype with real outputs from the official GACELA `maestro-short` checkpoint. It demonstrates only MAIA's generative inpainting component. It does not run CoverHunter, IDS-NMR, Grad-CAM, CMA-ES, or the complete MAIA attack search.

## Audited upstreams

- GACELA: <https://github.com/andimarafioti/GACELA>, commit `34649fb01bdecbcb266db046a8b9c48c141f16e1`.
- Checkpoint archive: <https://zenodo.org/records/3897144/files/maestro-short_checkpoints.zip>, MD5 `1ac767255cf9edd53b8215a4301132dc`.
- Extracted checkpoint: `real_data_240_32_240_checkpoints/01_310000.pt`, SHA-256 `bd32992080febfbc37f7e77b625ca11a4580c804a12cfa6bfdba4b2b14688970`.
- Audio source: J. S. Bach, Goldberg Variations, Variation 20, performed by Kimiko Ishizaka, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Kimiko_Ishizaka_-_21_-_Variatio_20_a_2_Clav.ogg), CC0 1.0 Universal.

Large checkpoints, upstream source, and the local environment live under `.cache/` and `.venv/` and are not committed.

## Compatibility notes

The original GACELA requirements target PyTorch 1.1. This reproduction uses PyTorch 2.0.1 on Apple Silicon and directly instantiates the unchanged upstream `Generator` and `BorderEncoder` classes. The compatibility layer:

1. replaces the notebook's floating-point `md / 2` channel count with integer `md // 2`;
2. uses keyword arguments for the modern `librosa.filters.mel` signature;
3. loads the PyTorch 1.1 checkpoint onto CPU with `map_location="cpu"`;
4. reproduces the upstream mel-conditioning, random latent tensor, and PGHI magnitude inversion;
5. verifies the checkpoint hash and records the number and absolute sum of loaded parameters.

No output is generated when the checkpoint fails to load.

## Reproduce

```bash
conda env create -p .venv -f environment.yml
LDFLAGS=-L/opt/homebrew/lib CPPFLAGS=-I/opt/homebrew/include .venv/bin/pip install ltfatpy==1.1.2
.venv/bin/python download_model.py
.venv/bin/python prepare_input.py
.venv/bin/python infer_gacela.py
.venv/bin/python make_spectrograms.py
.venv/bin/python build_manifest.py
.venv/bin/python validate_demo.py
python3 validate_page.py
```

The public artifacts are written to:

- `maia/data/audio/real-demo/`
- `maia/data/spectrograms/real-demo/`
- `maia/data/manifests/real-demo.json`

The three candidates use fixed seeds. The default candidate is selected from non-silent, finite, non-clipping outputs by the lowest mean boundary discontinuity, with absolute RMS difference as a tiebreaker. Only the aligned GACELA gaps are replaced; a 20 ms crossfade is confined to each gap.
