# LSA-Probe finished comparison figure — design QA

Date: 2026-09-05

## Evidence

- Source visual truth: `/Users/yuxuanliu/Downloads/ICASSP.png` (1601×883 px), preserved byte-for-byte at `assets/legacy/lsa-probe-explanation-original.png`.
- Finished figure asset: `assets/figures/endpoint-vs-lsa-probe-en.svg` with a 3200×1800 PNG preview.
- Browser-rendered implementation screenshot: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-endpoint-figure-2026-09-05/browser-1280x720-en.png`.
- Responsive screenshots: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-endpoint-figure-2026-09-05/desktop-en.png`, `desktop-zh.png`, `mobile-en.png`, and `mobile-zh.png`.
- Combined source/implementation comparison: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-endpoint-figure-2026-09-05/reference-vs-finished.png`.
- Browser state: local `/lsa-probe/?lang=en#endpoint-loss`; CSS viewport 1280×720, device pixel ratio 1.4. Mobile state used CSS viewport 390×844 at the same density.
- Density normalization: the source and finished PNG were each aspect-fit into equal 1160×660 review panels. The comparison judged the figure content, not browser chrome or output density.

## Full-view comparison

The reference communicates the correct two-part scientific story but repeats spectrograms, crosses arrows, mixes formulas with prose and gives illustrative 0.05/0.06 values visual prominence. The finished asset preserves the two aligned layers and the member/non-member comparison while reducing the visual vocabulary to: endpoint evidence overlap, normalized budget length, one shared degradation target, and the `C_adv` ordering. No P0/P1/P2 visual mismatch remains relative to the requested simplification.

## Focused-region comparison

The lower LSA-Probe layer was inspected separately because it contains the most important scientific distinction. Both lanes terminate at the same degradation target; the member lane uses a solid, longer budget and the non-member lane uses a dashed, shorter budget. Labels and line style supplement color, and no sample-level result or probability is implied.

## Required fidelity surfaces

- Fonts and typography: the finished figure uses the page's sans-serif hierarchy, larger headings, short labels and explicit formula notation. English and Chinese remain readable at their target desktop and mobile compositions.
- Spacing and layout rhythm: member/non-member lanes are parallel; the two evidence layers use consistent padding, borders and alignment; mobile uses a dedicated portrait composition instead of shrinking the desktop asset.
- Colors and visual tokens: white and blue-gray surfaces, ink text, teal member encoding, amber non-member encoding and coral threshold accents match the current light LSA-Probe page.
- Image quality and asset fidelity: the production page loads finished SVG image files rather than HTML/CSS-assembled diagrams. Separate 2× PNGs exist for sharing and preview; SVG remains the primary web asset.
- Copy and content: long source paragraphs, repeated labels and 0.05/0.06 were removed. The remaining copy is bilingual, concise, and explicitly labels the figure as conceptual rather than measured sample-level data.

## Interaction and responsive checks

- English and Chinese image assets switch with the page language.
- Desktop and mobile `<picture>` sources resolve to the intended complete figure files.
- The enlargement dialog opens the correct language and viewport-specific SVG, closes normally, and carries the translated alternative text.
- No page-level horizontal overflow was found at 1280×720 or 390×844.
- Browser console check found no new errors or warnings related to the figure.

## Comparison history

1. Earlier implementation used an embedded translatable SVG on desktop and rebuilt the mobile comparison from HTML/CSS components. This conflicted with the requirement to create the figure first and place it as a finished asset.
2. Fix: created separate finished English/Chinese desktop and mobile SVGs, exported four 2× PNGs, replaced both runtime representations with responsive image sources, and retained the original reference in the legacy directory.
3. Post-fix evidence: the combined comparison and browser screenshots show the simplified figure as a single coherent artifact in both languages and at both tested responsive states.

## Findings

- No actionable P0, P1 or P2 findings remain.
- P3: the PNG preview renderer flattens mathematical subscripts more aggressively than the browser; the primary SVG renders them correctly and remains the production source.

final result: passed
