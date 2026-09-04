# LSA-Probe evidence-first research page

This directory is the production page at `/lsa-probe/`. It uses only the paper’s aggregate Table 1 results and original paper figures as empirical evidence.

The former mock-data page is preserved outside the deployment tree at:

`/Users/yuxuanliu/Documents/秋招/personal_website/_hidden_archive/lsa-probe-v1-before-interview-redesign/`

Its recoverable Git reference is:

`archive/lsa-probe-v1-pre-interview`

## Data boundary

- `data/evidence.json` contains the four Table 1 rows only.
- `assets/figures/figure2-*.png` are embedded images extracted directly from the author-supplied PDF.
- `assets/figures/framework.png` is the author-supplied framework image, copied without pixel modification.
- `assets/figures/stability-schematic.png` is explicitly conceptual and contains no measured values.
- No production code loads the archived random distributions, ROC arrays, budget ablations or per-sample membership scores.

Run the validator from the repository root:

```bash
node lsa-probe/scripts/validate-page.mjs
```
