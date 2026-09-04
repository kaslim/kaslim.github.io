# Design QA — MAIA research page

## Visual truth and comparison evidence

- Source visual truth: the pre-refactor `How MAIA Works` screenshots in `maia/audit/baseline/` and the protected paper assets `maia/assets/figures/2.png`, `3.png`, and `4.png`.
- Implementation evidence: `maia/audit/after/how-maia-works-after-top-1264x720.jpg`, `how-maia-works-after-segment-1264x720.jpg`, and `how-maia-works-after-inpainting-1264x720.jpg`.
- Combined source/implementation comparison input: `maia/audit/after/how-maia-works-comparison.jpg`.
- Desktop viewport and output: 1265 × 712 CSS pixels and 1265 × 712 screenshot pixels (density normalization 1:1).
- Mobile responsive evidence: a real 390 × 844 CSS-pixel iframe viewport captured in `maia/audit/after/local-mobile-390x844-responsive.jpg`, `local-mobile-demo-390x844.jpg`, and `local-mobile-focus-390x844-full.jpg`.
- Final production evidence: `maia/audit/online/maia-online-desktop-en.jpg`, `maia-online-demo-en.jpg`, `maia-online-demo-zh.jpg`, `maia-online-focus-step5-zh.jpg`, and the three `maia-online-mobile-*-390x844.jpg` captures.
- States compared: method top, protected segment figure, protected inpainting figure, English hero, English verified Demo, Chinese verified Demo, Focus View step 5, mobile hero, mobile Demo, and mobile Focus View step 5.

## Findings

- P0: none.
- P1: none remaining.
- P2: none remaining.
- Protected figures retain their original order, uncropped `width: 100%; height: auto` presentation, and original aspect ratio. SHA-256 checks confirm the image files are byte-identical to the baseline.
- The rebuilt navigation, typography, and research evidence sections intentionally differ from the source page, while the protected method-card sequence and source figures remain intact.

## Iteration history

1. Captured the existing method section and protected-figure hashes before editing.
2. Compared the first implementation to the source at the same 1265 × 712 viewport.
3. Found a mobile Focus View layout defect: the Demo heading retained a desktop two-column override at 390 pixels, causing severe line wrapping.
4. Added a mobile Focus View one-column override and recaptured the full 390 × 844 state, including navigation controls.
5. Re-ran static, data, image-integrity, and interaction checks after the fix.
6. Found first-load anchor drift after remote images settled, added post-load deep-link stabilization, and verified the production `#demo` route lands on the Demo heading at desktop and mobile widths.

final result: passed

---

# Design QA — LSA-Probe evidence-first rebuild

## Visual truth and comparison evidence

- Source visual truth: the pre-refactor production page at `https://kaslim.github.io/lsa-probe/`, captured before any production edit.
- Implementation evidence: the locally served rebuild at `http://127.0.0.1:8765/lsa-probe/`.
- Matched viewport: 1440 × 1000 CSS pixels; both full-page captures are 1425 CSS pixels wide after browser chrome.
- Source capture: `tmp/lsa-probe-audit/old-live-full-desktop.png`.
- Implementation capture: `tmp/lsa-probe-audit/new-local-full-desktop.png`.
- Combined comparison input: `tmp/lsa-probe-audit/source-vs-implementation.png`.
- Responsive states inspected: English desktop, Chinese desktop, Chinese Focus step 6, 390 × 844 Chinese mobile, and 768 × 1024 English Focus step 5.

## Findings

- P0: none.
- P1: none remaining.
- P2 fixed: the Evidence Explorer initially expressed an absolute TPR gain as `+8%` in percentage mode. It now uses `+8 pp`, while AUC deltas remain decimal.
- P2 fixed: the citation-copy handler retained `event.currentTarget` across an asynchronous boundary, causing a delayed null-reference error. The button reference is now captured before the await.
- The rebuild intentionally keeps the deep, research-oriented visual identity while replacing forced viewport-height sections and large blank intervals with continuous evidence-dense sections.
- The source page’s sparse hero, compact top navigation and restrained cyan accent informed the implementation; its mock charts, inconsistent names and unsupported claims were not treated as visual truth.
- The author framework and paper Figure 2 panels use their native aspect ratios with `object-fit: contain`; no paper image is cropped or stretched.
- Focus View uses the same DOM as the continuous page and exposes one research claim per step without private notes or interview-answer content.

## Interaction and accessibility checks

- Language switching updates `html[lang]`, title, meta description, visible copy, figure alt text and ARIA labels without reloading.
- URL language overrides local storage; unknown languages fall back to English.
- Focus deep links restore the requested step and language; language changes preserve the active step and Evidence Explorer selection.
- Previous/Next, Left/Right, Escape and touch-swipe paths are implemented.
- The Evidence Explorer uses only the four audited Table 1 rows and preserves model/dataset selection across language changes.
- The algorithm walkthrough is paused by default and provides Play, Pause, Step and Reset controls.
- Keyboard focus states, reduced-motion behavior, mobile layout and image-dialog labels are present.
- Local browser logs show no new console or network errors after the fixes.

final result: passed
