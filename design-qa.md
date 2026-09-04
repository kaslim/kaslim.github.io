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

# Design QA — TS-RaMIA evidence-first interview redesign

## Visual truth and comparison evidence

- Source visual truth: the user-reviewed pre-redesign captures under `/Users/yuxuanliu/Documents/秋招/audits/ts-ramia-2026-09-05/`, especially `01-hero-desktop.png`, `02-method-desktop.png`, `04-demo-after.png`, `05-results-desktop.png`, `06-low-fpr-desktop.png`, and `07-mobile-hero.png`.
- Scientific visual truth: the final PMLR 303 paper and its unchanged Figure 1 / Figure 2 assets extracted by `ts-ramia/scripts/extract-paper-figures.py`.
- Browser-rendered implementation evidence: `/Users/yuxuanliu/Documents/秋招/audits/ts-ramia-2026-09-05-redesign/local/`.
- Full-view comparison input: `source-vs-implementation-hero.png`, which places the previous and rebuilt heroes in one 2880 × 954 image after both sides were normalized to 1440 × 900.
- Focused comparison input: `source-vs-implementation-evidence.png`, which places the previous fabricated sample-result view beside the PMLR Table 1 evidence explorer in one 2880 × 954 image after the same normalization.
- Source screenshot size: 1265 × 712 pixels. Desktop implementation screenshot size: 1425 × 891 pixels from a 1440 × 900 CSS viewport. Normalization was used only for visual comparison, not for production assets.
- Focus View evidence: `focus-step-1-en-1280x720.jpg` through `focus-step-8-en-1280x720.jpg` at 1280 × 720 CSS/pixel output, plus step 5, 6 and 8 captures at 1440 × 900.
- Mobile evidence: `mobile-navigation-en-390x844.jpg`, `mobile-evidence-en-390x844.jpg`, `mobile-focus-step-5-en-390x844.jpg`, and `mobile-focus-step-8-en-390x844.jpg` from a 390 × 844 CSS viewport; visible screenshots are 375 × 812 pixels after the browser scrollbar/chrome crop.
- States compared: English and Chinese hero, threat model, confounder trap, Figure 1 pipeline, matched Evidence Explorer, ablations, limitations, Agent Safety Bridge, Focus steps 1–8, mobile navigation, mobile evidence, image dialog, and conference slides.

## Findings

- P0: none.
- P1: none remaining.
- P2 fixed: first-load language rendering removed `focus=1&step=n` before Focus state initialized. Initial Focus state is now parsed before the language event and verified at all eight deep links.
- P2 fixed: the first mobile Sections menu overlaid the hero and omitted six ordinary sections. It now uses an in-flow two-row header layout, exposes all 14 Normal View sections, and leaves the hero below the expanded menu.
- P2 fixed: direct hash links landed early because the published-results table expanded above the target after the browser performed its first anchor jump. The page now repositions the target after data rendering with a one-frame, nonanimated correction.
- P2 fixed: image-dialog Escape behavior and citation-copy feedback were not deterministic in the in-app browser. The dialog now handles cancel/Escape explicitly and citation copy includes a controlled fallback.
- The visual move from the old purple promotional landing page to a dark evidence-first research interface is intentional. The blue/amber/green project language remains, while unsupported badges, emoji, fake sample probabilities, and overclaiming were removed.

## Required fidelity surfaces

- Fonts and typography: the implementation uses a consistent Inter/system sans stack, restrained all-caps evidence labels, compact body copy, and a clear hero-to-section hierarchy. English and Chinese share the same size and weight system and wrap without forced downscaling.
- Spacing and layout rhythm: Normal View uses continuous research sections; Focus View uses independent header/content/footer grid rows. Every English and Chinese Focus step reported equal `clientHeight` and `scrollHeight` at 1280 × 720 and 1440 × 900, with controls outside the content row.
- Colors and visual tokens: the established blue, amber, and green meanings are consistent across interaction, scientific caution, and supported-evidence states. Dark surfaces preserve contrast without decorative gradients or oversized shadows.
- Image quality and asset fidelity: Figure 1 is the embedded final-paper raster and Figure 2 is a high-resolution paper-page extraction cropped only to the figure boundary. Images use natural aspect ratios, no redrawing, no CSS substitutes, no generated scientific assets, and no interpolation into new evidence.
- Copy and content: the official title, nine-author order, PMLR metadata, Table 1, Table 2, NotaGen results, negative results, threat model, limitations, and Agent Safety future-work boundary were checked against the final paper. The page avoids treating raw NLL or an aggregate table value as a sample-level membership probability.
- Icons and imagery: no emoji or custom SVG/CSS scientific illustrations replace paper assets. Text labels and native controls carry the interface; the retained `TS` mark is a brand monogram, not a surrogate research figure.

## Interaction and accessibility checks

- Bare URL English, explicit `?lang=en`, explicit `?lang=zh`, language switching on Focus step 8, hash preservation, and step preservation were exercised.
- Focus Previous/Next, ArrowLeft/ArrowRight, Home/End, Escape, URL restoration, and the polite step announcement were exercised. Programmatic H2 focus has no button-like outline; interactive controls retain `:focus-visible` styling.
- Evidence Explorer exercised all 36 view/method/metric combinations with no empty values; Focus evidence tabs returned the exact three published AUC triplets.
- Figure 1 stage tabs, image modal open/Escape/focus return, citation copy, mobile menu open/Escape/section selection, and responsive table scrolling were tested.
- Browser-rendered image checks found all three production figure assets decoded at their declared native dimensions. Fresh-page console checks returned no errors and no missing translation keys.
- The retained 18-slide AAAI deck opened and advanced, notes toggled with N, and ESC closed notes/TOC. Fullscreen could not be entered in the automated browser because the connector denies fullscreen permission; the page's fullscreen handler remained unchanged.
- Reduced-motion CSS, semantic tables, heading structure, alt text, native controls, dialog semantics, skip link, and keyboard focus paths were inspected. This is an implementation-level check, not a claim of complete WCAG certification.

## Comparison history

1. The source comparison exposed promotional framing, unsupported “first” claims, emoji, and fabricated sample-level outcomes.
2. The first rebuilt implementation replaced these with the final-paper title, real Figure 1/2 assets, aggregate Table 1/2 evidence, confounder controls, negative results, and explicit deployment limits.
3. Browser QA found Focus deep-link loss, mobile menu overlay/incomplete coverage, delayed deep-anchor placement, dialog Escape, and copy-feedback issues.
4. Each issue was fixed and retested at the same state. Final geometry checks covered all eight steps in English and Chinese at 1280 × 720 and all eight English steps at 1440 × 900; no content/footer overlap or horizontal overflow remained.
5. Mobile 390 × 844 retesting confirmed the complete 14-link menu is in flow, the hero is not covered, the Evidence table scrolls inside its own container, and Focus controls remain in a separate row.
6. Final static validation passed published-number checks, language-key parity, asset existence, forbidden-content scans, and production-script dependency checks.

final result: passed

---

# Design QA — LSA-Probe Focus View interview increment

## Visual truth and comparison evidence

- Source visual truth: the user-supplied review captures in `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-2026-09-05/`, especially `05-focus-method-cn.png`, `07-focus-evidence-en.png`, `11-focus-reliability-en.png`, `10-focus-agent-bridge-en.png`, `03-paper-figures-cn.png`, and `08-mobile-overview-en.png`.
- Implementation evidence: browser-rendered local captures in `/Users/yuxuanliu/Documents/秋招/audits/lsa-probe-2026-09-05-round2/`.
- Matched full-view comparisons: `comparison-method-before-after-1280x720.png` and `comparison-figure2-before-after.png`; each places the source and implementation in one comparison image.
- Desktop Focus evidence: `local-focus-8steps-contact-sheet.png` at 1280 × 720 CSS pixels and `local-focus-8steps-contact-sheet-1440x900.png` at 1440 × 900 CSS pixels.
- Mobile evidence: `local-mobile-nav-closed-390x844.png`, `local-mobile-nav-open-390x844.png`, `local-mobile-focus-step5-390x844.png`, `local-mobile-focus-step8-390x844.png`, and `local-mobile-evidence-390x844.png` at 390 × 844 CSS pixels.
- Focused-region evidence: `local-walkthrough-modal-1280x720.png`, `local-programmatic-focus-step5-1280x720.png`, and `local-figure2-cropped-1280x720.png`.
- Density normalization: browser captures were compared at 1 CSS pixel to 1 screenshot pixel. The Figure 2 source and implementation captures are both 1265 × 712 pixels; the Focus method source and implementation captures are both 1280 × 720 pixels.
- States compared: Focus steps 1–8, method figure, algorithm dialog, low-FPR evidence, reliability/limitations, Agent Safety boundary, Figure 2, mobile closed/open navigation, mobile evidence, and mobile Focus steps 5 and 8.

## Findings

- P0: none.
- P1: none remaining.
- P2 fixed: the floating Focus footer obscured method, reliability and Agent Safety content. Focus mode now uses three independent `100dvh` grid rows for header, content and controls.
- P2 fixed: the previous method screen overflowed and showed a large programmatic heading outline. The method figure is capped at the requested viewport-relative height, the walkthrough opens in a separate dialog, and non-interactive programmatic H2 focus is visually neutral.
- P2 fixed: Focus omitted the two-threshold distinction and time normalization. They now form a dedicated fourth step with three cards and the paper-aligned formulas.
- P2 fixed: Figure 2 panels contained excessive near-white extraction margins. Originals are preserved byte-for-byte under `lsa-probe/assets/figures/original-extracts/`; production uses verified rectangular margin-only crops at native aspect ratio.
- P2 fixed: mobile navigation clipped horizontally. A keyboard-accessible in-flow Sections menu now exposes every ordinary section without covering the hero.
- P2 fixed: parameterless visits could inherit Chinese from local storage. A URL without a valid `lang` parameter now always initializes in English; explicit language switches update the URL while preserving Focus step and hash.

## Required fidelity surfaces

- Fonts and typography: existing family, weights and research-page hierarchy are preserved; compact Focus variants reduce spacing without shrinking Chinese independently.
- Spacing and layout rhythm: all eight desktop steps fit their content row at 1280 × 720 and 1440 × 900; measured stage and footer rectangles meet without overlap.
- Colors and visual tokens: the established dark surfaces, mint accent, amber scientific-boundary treatment and focus-ring tokens are unchanged.
- Image quality and asset fidelity: the author framework figure remains unchanged; Figure 2 pixels inside each crop rectangle exactly match the preserved original extraction, with no redraw, resampling or forced aspect ratio.
- Copy and content: Focus View reorganizes audited paper content only. The exact Table 1 values, aggregate-vs-sample boundary, strong white-box limitation and Agent Safety non-transfer boundary remain explicit.

## Interaction and accessibility checks

- Previous/Next, ArrowLeft/ArrowRight and Escape were exercised in the in-app browser.
- Step changes reset the new slide's internal scroll position to zero.
- Algorithm and image dialogs close with Escape and return focus to their triggering buttons.
- Programmatic Focus headings remain available to assistive technology without a button-like visual outline; actual controls retain visible `:focus-visible` rings.
- The mobile Sections menu sends focus to its first link when opened, closes with Escape, and returns focus to the trigger.
- Language deep links, language switching on Focus step 8, Evidence Explorer combinations, percentage display, citation copy, mobile layout and browser-console state were tested.
- Browser console log checks returned no errors. This is an implementation-level accessibility check, not a claim of full WCAG certification.

## Comparison history

1. Source review showed a floating footer covering the framework image and lower scientific content, missing Focus explanations, oversized Figure 2 canvases and clipped mobile navigation.
2. The layout, Focus composition, image assets, language state and mobile navigation were updated without changing ordinary-mode scientific sections.
3. Same-state comparisons at 1280 × 720 confirmed that the method figure and controls now fit in independent rows and that the large H2 focus rectangle is gone.
4. Same-size Figure 2 comparison confirmed that only outer near-white margins were removed; the plots are larger and retain their original data, axes, colors and legends.
5. Geometry checks across every Focus step at 1280 × 720 and 1440 × 900 reported no content/footer overlap and no horizontal overflow. Mobile checks at 390 × 844 reported no horizontal overflow and an independent footer with scroll confined to the content row where necessary.
6. Final static validation passed exact Table 1 values, translation parity, asset resolution, production-script dependency checks and Figure 2 crop hashes.

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
