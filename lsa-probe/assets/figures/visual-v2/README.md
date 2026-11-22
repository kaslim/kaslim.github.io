# Research figures

Eight independent SVG plates serve both language editions and both reading modes. Each has a landscape layout and a separately composed portrait layout. Text and equations export as glyph paths, including Chinese characters. Figure 01 embeds its illustration in each file.

[manifest.json](manifest.json) records each filename, section, language, layout, source, evidence status, visual review and SHA-256 digest. The results panel also records the hashes of both evidence files used to draw it.

## Sources

| Plate | Source and interpretation |
| --- | --- |
| 01 | White-box task definition and track-level evidence in the [fact audit](../../../audit/FACT_AUDIT.md). The cassette and opened checkpoint are a conceptual illustration made with the built-in image generator. |
| 02 | Inspected AudioLDM-style configuration and training-manifest checks in the fact audit. Crop windows and waveforms are schematic. |
| 03 | General clean reconstruction and paired local response. The located journal endpoint baseline uses single-step clean latent prediction. |
| 04 | LSA-Probe search in the [conference paper](https://arxiv.org/html/2602.01645v1) and [original framework](../framework.png). No individual search traces are plotted. |
| 05 | Journal method draft and historical scorer described in the fact audit. The drawing ends with reference transformation and temporal aggregation. The positive-only rule awaits alignment. |
| 06 | Journal method draft and fact audit. The two examples show ordinal Raw MS positions for illustration. The q95 is a neighborhood statistic. |
| 07 | Independent reference roles in the September 2026 manuscript design. Ground truth enters evaluation statistics. The historical results have a different calibration provenance. |
| 08 | [ICASSP Table 1 records](../../../data/evidence.json) and [July AudioLDM-style draft records](../../../data/journal-evidence.json). Matplotlib reads the rates directly as proportions. The bars show TPR, and panel B separately labels empirical FPR. Conference intervals remain in the HTML data table. |

## Editable sources

The text, equations, graphic primitives and coordinates are in [plates.py](source/plates.py) and [study.py](source/study.py). [results.py](source/results.py) draws the measured values. [illustration-prompt.txt](source/illustration-prompt.txt) is the prompt submitted to image_gen.imagegen. [checkpoint-illustration.jpg](source/checkpoint-illustration.jpg) is the illustration used in the composite.

From this directory, with Python, Matplotlib 3.8.4 and Pillow installed, run `python source/build.py`. The renderer uses DejaVu Sans and Noto Sans CJK SC. Set `LSA_CJK_FONT` to the path of `NotoSansCJKsc-Regular.otf` when it is outside the system font search path.

For review, render each SVG with librsvg or open it directly in a browser. The page regression script exercises the actual loaded file, enlargement, download, locale switch, evidence tables and all eight Focus steps at 1280 × 720 and 390 × 844.
