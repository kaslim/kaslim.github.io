# MAIA technical deep-dive and robustness roadmap — design QA

## Scope and visual baseline

- Incremental update only: the existing research-page design system, real paper figures, verified GACELA demo, aggregate results, citation, and resource links were preserved.
- Source captures: `/Users/yuxuanliu/Documents/秋招/audits/maia-2026-09-05-technical-deep-dive/source/`
- Implementation captures: `/Users/yuxuanliu/Documents/秋招/audits/maia-2026-09-05-technical-deep-dive/implementation/`
- Paired comparisons: `/Users/yuxuanliu/Documents/秋招/audits/maia-2026-09-05-technical-deep-dive/comparisons/`

The paired captures confirm that the parchment background, ink-blue hierarchy, serif headings, card radii, borders, navigation, and control styling remain continuous with the previous page. The method section now uses progressive disclosure instead of exposing the full computation by default.

## New method interactions

- Grad-CAM and black-box coarse-to-fine localization are independent native `details` panels. All four method detail panels are closed on first load and when Focus Step 4 is entered from another step.
- Native summary activation works by pointer and keyboard, reports `aria-expanded`, and remains open when switching languages without a refresh.
- The coarse-to-fine mechanism animation has Pause/Resume and Reset controls. Reduced-motion mode removes its pulse animation and initializes it in a paused state.
- The GACELA mechanism diagram explicitly separates unchanged left context, the masked/generated local region, and unchanged right context.
- White-box reconstruction/attack/re-inpainting and black-box CMA-ES optimization are independently expandable. The formulas wrap on narrow screens instead of widening the page.

## Evidence boundary

- The standalone Demo boundary limitation card was removed; the remaining Scope of evaluation and Access assumptions cards form two equal 560 px columns at 1280 px and one column on mobile.
- The verified demo retains its concise scope disclaimer, provenance panel, target-model-evaluated flag, hashes, three fixed seeds, audio, spectrograms, and synchronization controls.
- Transferability and transformation robustness are labeled `Not evaluated in the current paper` and presented only as mechanism-based hypotheses plus an evaluation roadmap.
- Protected paper figures `2.png`, `3.png`, and `4.png` remain byte-identical.

## Responsive and Focus checks

- 1280×720: Focus Steps 1–9 report no horizontal page overflow and no overlap with the independent bottom control row. Step 4 fits exactly in the 586 px content area with all technical panels closed.
- 1280×800: Focus Steps 4, 7, and 9 report no horizontal overflow or control overlap. Step 4 fits exactly in the 666 px content area.
- 390×844: Normal method and robustness sections report zero page-level horizontal overflow. The robustness table scrolls only inside its labeled table region. Focus Steps 1, 4, 7, and 9 retain a separate control row and allow content-area scrolling where required.
- Focus navigation was verified for Previous/Next, ArrowLeft/ArrowRight, Home/End, Escape, URL step updates, and `1 / 9` through `9 / 9` progress.

## Functional regression checks

- Default language is English; `?lang=en` and `?lang=zh-CN` load correctly. Language switching preserves the current Focus step and open/closed panel state.
- The real-demo manifest loads with three candidates. Candidate seed switching, synchronized Original/Regenerated A/B switching, looped-region seeking, playback, and pause were exercised successfully.
- Copy citation reports `Citation copied`; paper, GACELA, and manifest links remain present.
- Browser console logs were empty during the tested interactions, all loaded images had valid natural dimensions, and no missing locale keys were found.
- `validate_demo.py` passed for all three fixed candidates with zero difference outside the recorded regions. `validate_page.py` passed the 1–9 Focus sequence, locale, local-asset, protected-figure, verified-manifest, and prohibited-random-reference checks.

## Findings

- P0: none.
- P1: none.
- P2: none after formula wrapping, Focus control-row separation, and mobile containment fixes.

final result: passed
