# LSA-Probe / MS-CHN

This page follows music diffusion membership auditing from controlled training through reconstruction baselines, local stability and similarity-conditioned scoring. English is the default. Use `?lang=zh-CN` for Chinese and `?focus=1&step=1` for Focus View.

- `index.html` contains the ordinary page and the eight Focus steps. Each step maps to the ordinary section with the same `data-focus-step`.
- `locales/en.json` and `locales/zh-CN.json` supply visible labels and accessible names. `js/app-v2.js` is the production interaction script.
- `data/evidence.json` reports the four ICASSP Table 1 rows. `data/journal-evidence.json` describes an earlier journal draft with its own target split, aggregation and evidence status.
- `audit/FACT_AUDIT.md` records the available sources and their scope. Figure 2 uses the published conference panels and the crop manifest records the original/cropped image hashes.
- The scoring diagrams and search walkthrough are conceptual.

Serve the repository at its root with `python3 -m http.server 8000`. Before publishing, run `node lsa-probe/scripts/validate-page.mjs`, then check the ordinary page and all Focus steps in both languages at 1280 × 720 and 390 × 844. Check the result selectors, image enlargement, citation copy, previous/next, arrow-key and swipe navigation, and exit positioning.

GitHub Pages builds from the root of `main`. Confirm the Pages deployment for the release commit and open the public page after the build succeeds.
