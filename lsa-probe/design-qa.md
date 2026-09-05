# LSA-Probe paper-style comparison figure — design QA

Date: 2026-09-06

## Evidence

- Source visual truth: `/Users/yuxuanliu/Downloads/ICASSP.png` (1601×883 px), preserved byte-for-byte at `assets/legacy/lsa-probe-explanation-original.png`.
- Finished desktop assets: `assets/figures/endpoint-vs-lsa-probe-paper-visual-en.png` and `assets/figures/endpoint-vs-lsa-probe-paper-visual-zh.png` (1672×941 px each).
- Finished mobile assets: `assets/figures/endpoint-vs-lsa-probe-paper-visual-mobile-en.png` and `assets/figures/endpoint-vs-lsa-probe-paper-visual-mobile-zh.png` (985×1597 px each).
- Browser-rendered desktop evidence: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-paper-visual-2026-09-06/desktop-en-browser.png` and `desktop-zh-browser.png` at a 1280×720 CSS viewport and 1× density.
- Browser-rendered mobile evidence: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-paper-visual-2026-09-06/mobile-en-browser.png` and `mobile-zh-browser.png` at a 390×844 CSS viewport and 1× density.
- Same-input comparison evidence: `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-paper-visual-2026-09-06/reference-vs-finished-asset.png` and `reference-vs-browser.png`.
- State: local `/lsa-probe/?lang=en#endpoint-loss` and `/lsa-probe/?lang=zh-CN#endpoint-loss`; normal view, light theme.
- Density normalization: the source and implementation were aspect-fit into equal 1240×760 review panels. Browser chrome and surrounding page content were treated as implementation context rather than figure content.

## Full-view comparison

The source communicates the correct endpoint-versus-stability distinction but repeats the same piano spectrogram many times, uses crossing arrows, interleaves formulas with paragraphs, and promotes illustrative 0.05/0.06 values. The finished asset keeps the source's recognizable piano-spectrogram visual identity and two-tier narrative while reducing the information to aligned member/non-member lanes, overlapping endpoint evidence, normalized budget length, one shared degradation threshold, and the `C_adv` ordering.

The browser rendering preserves the finished asset's natural aspect ratio, uses the intended complete image file rather than runtime card assembly, and integrates with the page's existing white/blue-gray surface and border treatment.

## Focused-region comparison

The lower LSA-Probe layer was inspected separately because it contains the key scientific distinction. Both lanes terminate at the same coral threshold; the member lane uses a visibly longer teal budget arrow and the non-member lane uses a shorter amber arrow. The bar comparison and formula reinforce the ordering without sample values or a categorical verdict. The Chinese version preserves the same geometry, spacing and evidence boundary.

## Required fidelity surfaces

- Fonts and typography: headings and short labels are substantially larger and less crowded than the source. English and Chinese remain legible in their dedicated desktop/mobile compositions; no formula or label is clipped.
- Spacing and layout rhythm: the two scientific layers have matched rounded containers, parallel lanes and consistent margins. The 1280×720 browser view shows the complete figure without horizontal overflow.
- Colors and visual tokens: ink, teal, amber, coral and light blue-gray match the LSA-Probe light theme. Member/non-member meaning is reinforced by labels and icons rather than color alone.
- Image quality and asset fidelity: the finished figures retain the piano-spectrogram subject of the source, render sharply at their target sizes, and avoid stretching. Mobile uses a separate portrait composition rather than shrinking the desktop image.
- Copy and content: long source prose, repeated labels, “MIA Score,” 0.05 and 0.06 were removed. The remaining copy is bilingual and explicitly labels the image as conceptual rather than measured sample-level data.

## Interaction and accessibility checks

- English and Chinese assets switch with the page language.
- Desktop and mobile `<picture>` sources select the intended complete PNG.
- The enlargement dialog opens the correct language and viewport-specific asset, carries translated alternative text, and returns focus after closing.
- No page-level horizontal overflow was found at 1280×720 or 390×844.
- Browser console check returned no errors or warnings.

## Comparison history

1. Earlier page version used a clean but abstract vector treatment that dropped the source image's recognizable piano-spectrogram visual language.
2. Fix: created a new reference-guided paper-style figure, removed the source's excessive text and illustrative numbers, and produced separate complete English/Chinese desktop and mobile assets.
3. Post-fix evidence: the combined source/asset and source/browser comparisons show that the scientific story is preserved while the visual hierarchy is materially clearer. No actionable P0, P1 or P2 issue remains.

## Findings

- No actionable P0, P1 or P2 findings remain.
- P3: small mathematical labels in the mobile image are best inspected through the existing enlargement dialog, but the main scientific relationship remains readable in the inline portrait composition.

final result: passed
