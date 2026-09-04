# TS-RaMIA production-page fact audit

Authoritative source: the final PMLR 303 paper and its official proceedings page.

## Removed from the production page

- “First MIA” and similar priority claims.
- The old Bach/Chopin/Mozart/Beethoven sample-level demo.
- Fabricated per-token scores, fusion probabilities, labels, and attack-success states.
- Old headline results such as AUC 0.925 and TPR@1%FPR 44.2%.
- The unsupported rule “higher NLL = more likely memorized.”
- The old four-temperature fusion presentation as the core method.
- Placeholder links, one-author citation text, and `contact@example.com`.

## Production evidence

- Table 1 values come from `data/published-results.json`, transcribed from PMLR 303 Table 1.
- Table 2 values come from the same file, transcribed from PMLR 303 Table 2.
- Figure 1 is the embedded paper image extracted without redrawing.
- Figure 2 is a raster rendering of the published vector figure, cropped only to remove surrounding paper text and whitespace.

## Important paper-internal caveat

The rasterized Figure 2 contains labels that do not match the final Table 1 values. The redesigned page therefore treats the published Table 1 as the numerical reporting source and reproduces Figure 2 only as an unedited paper figure with an explicit provenance note. No values are digitized from the figure.

## Interpretation boundaries

- Membership inference is statistical audit evidence, not plagiarism detection, extraction, similarity search, or standalone legal proof.
- NotaGen is cross-representation evidence under distribution shift, not an in-distribution replication.
- The Agent Safety section is a conceptual research transfer, not an experiment reported in TS-RaMIA.
