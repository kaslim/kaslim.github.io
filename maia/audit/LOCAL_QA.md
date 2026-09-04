# MAIA local QA record

Validation date: 2026-09-04

## Data and provenance

- Manifest JSON parses and all referenced audio and spectrogram files exist.
- Three fixed candidates (seeds 1401, 2207, and 3511) decode at 22,050 Hz and contain 661,500 samples (30 seconds).
- Original, masked, and regenerated lengths match.
- All outputs are finite, non-silent, and non-clipping; maximum absolute sample value is 0.58050537109375.
- Maximum difference outside the three recorded effective regions is 0.0 for every candidate.
- Protected figures 2.png, 3.png, and 4.png match the pre-refactor SHA-256 values.
- Active HTML and JavaScript contain no reference to the legacy samples, random metrics, fake predictions, `Successful Attack`, or `Live Generation`.

## Page and interaction checks

- Default language without saved state: English.
- `?lang=en` and `?lang=zh-CN`: passed.
- Unsupported query language falls back to English: passed.
- Language choice persists in local storage: passed.
- Language switching preserves the candidate (seed 2207), 5.0-second shared timeline position, open provenance panel, Focus state, and Focus step 5: passed.
- Manifest-only Demo load and missing-error state: passed.
- Original / Regenerated A/B switch preserves 5.0-second position: passed.
- Audio playback advanced from 5.0 to 6.1 seconds: passed.
- Region loop, candidate switching, provenance expansion, and synchronized source switching: passed.
- Focus View deep link `?focus=1&step=5`: passed.
- Focus View right/left arrow navigation moved 5 → 6 → 5: passed.
- Escape exited Focus View and removed its query parameters: passed.
- Desktop, 390 × 844 mobile, and mobile Focus View visual checks: passed after one layout correction.
- Every requested local page asset returned HTTP 200 from the local server.

## Scope boundary

No target classifier, retrieval model, Grad-CAM localization, CMA-ES search, or complete MAIA attack loop was run for the public sample. This page demonstrates verified GACELA local regeneration only and reports paper-level results separately.
