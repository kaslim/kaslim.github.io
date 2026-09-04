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
