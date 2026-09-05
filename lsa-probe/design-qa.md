# LSA-Probe explanatory graphics — design QA

Date: 2026-09-05

## Compared sources

- Reference: author-provided `ICASSP.png`, preserved at `assets/legacy/lsa-probe-explanation-original.png`.
- Implementation: rendered production comparison figure from the local LSA-Probe page.
- Combined review image: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-graphics-2026-09-05/after/design-qa-comparison.png`.

## Visual review

- [x] Preserves the source scientific narrative while removing the illustrative 0.05/0.06 values.
- [x] Uses strictly parallel member and non-member lanes in both comparison layers.
- [x] Reduces duplicated spectrograms, crossed connectors, heavy borders and competing explanatory paragraphs.
- [x] Distinguishes member and non-member with labels plus solid/dashed geometry, not color alone.
- [x] Shows one fixed perceptual degradation threshold and different minimum normalized budgets.
- [x] Keeps endpoint evidence and LSA-Probe evidence visually separate.
- [x] Maintains the page's light research palette, radius, border and typography system.
- [x] Formula subscripts render correctly in the production SVG.
- [x] The audit flow treats the candidate audio and audited diffusion model as joint inputs.
- [x] The generative-support figure places member and non-member candidates on the same support region.
- [x] Mobile layouts use purpose-built vertical HTML views for the audit and comparison rather than shrinking the desktop diagrams.
- [x] Focus Step 1 fits at 1280×720 without being covered by the control bar.
- [x] Focus Step 5 remains vertically scrollable on mobile and its final content clears the bottom controls.

## Evidence and accessibility review

- [x] All three diagrams are labeled as conceptual explanations rather than measured sample data.
- [x] The manifold copy states that the surface is not analytically recovered and the tendency is not universal.
- [x] SVG title, description, page captions and enlargement controls have bilingual accessible text.
- [x] SVG enlargement uses the existing modal, closes with Escape and returns focus to its trigger.
- [x] No horizontal page overflow at 1440×900, 1280×800, 1280×720, 768×1024 or 390×844.
- [x] Browser console review found no errors or warnings.

Result: passed
