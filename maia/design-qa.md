# MAIA research-question copy update — design QA

## Scope

- Precise copy and attribution update only; the existing MAIA visual system, page order, research figures, verified regeneration demo, evidence, and interactions remain unchanged.
- Source baseline: `/Users/yuxuanliu/Documents/秋招/audits/maia-2026-09-05-question-copy/source/`
- Implementation captures: `/Users/yuxuanliu/Documents/秋招/audits/maia-2026-09-05-question-copy/implementation/`

## Visual comparison

- Focus View, English, 1280×720: `source-vs-implementation-focus-en-1280x720.png`
- Normal View, English, 1280×800: `source-vs-implementation-normal-en-1280x800.png`
- Normal View, Chinese, 390×844: `source-vs-implementation-mobile-zh-390x844.png`
- All captures use device scale factor 1.

The paired comparisons confirm that the existing parchment background, ink-blue hierarchy, card numbering, borders, radii, navigation, and control styling are preserved. Only the requested research framing and author attribution changed. Focus Step 1 received a scoped spacing adjustment to accommodate the longer approved copy without altering the component language.

## Layout checks

- 1280×720 Focus Step 1: all three English cards end at y=581.45px; controls begin at y=639.22px. Minimum clearance is 57.77px.
- 1280×720 Focus Step 1: all three Chinese cards end at y=511.86px; controls begin at y=639.22px.
- 1280×800 Focus Step 1: English and Chinese content fit without internal scrolling or overlap.
- 390×844 Normal View: document width is contained to the viewport; no horizontal page overflow, title clipping, or card overflow was detected.
- Equal card heights are retained within each language and viewport.

## Content and state checks

- `/maia/?lang=en`: approved English title, explanation, and three method cards.
- `/maia/?lang=zh-CN`: approved Chinese title, explanation, and three method cards.
- `/maia/?lang=en&focus=1&step=1`: approved English content with Focus Step 1 restored.
- `/maia/?lang=zh-CN&focus=1&step=1`: approved Chinese content with Focus Step 1 restored.
- Clicking the language control preserves `focus=1` and `step=1`; refreshing the resulting URL restores the same state.
- The bare `/maia/` URL resolves to English.

## Integrity checks

- Author order is unchanged: Yuxuan Liu, Peihong Zhang, Rui Sang, Zhixin Li, Shengchen Li.
- All requested contribution-role labels and the two author-name contribution stars are absent from the MAIA page source and locale files.
- Locale JSON parses successfully and JavaScript syntax checks pass.
- The verified demo initializes with three fixed candidates, its error state remains hidden, and all page images report valid natural dimensions.
- Git diff confirms no changes under `maia/assets/`, `maia/data/`, the demo manifest, audio, spectrograms, method figures, paper PDF, BibTeX block, aggregate results, threat model, or Agent Safety Bridge.

## Findings

- P0: none.
- P1: none.
- P2: none after the Focus Step 1 fit and mobile containment fixes.

final result: passed
