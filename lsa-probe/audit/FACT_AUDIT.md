# LSA-Probe / MS-CHN evidence notes

Updated 2026-11-20.

`raw-verified` denotes a claim checked against aligned experimental artifacts. `manuscript-reported` denotes a value checked in a manuscript. `unresolved` denotes incomplete provenance or a conflict between versions.

| Claim | Source | Protocol | Evidence status |
| --- | --- | --- | --- |
| Conference title, authors, and published status | [IEEE DOI](https://doi.org/10.1109/ICASSP55912.2026.11461689) and [arXiv record](https://arxiv.org/abs/2602.01645) | ICASSP 2026 | manuscript-reported |
| Four conference results and 3–8 percentage-point TPR gains | [Table 1](https://arxiv.org/html/2602.01645v1#S2.T1) and [conference evidence](../data/evidence.json) | Matched-compute MusicLDM/DiffWave × MAESTRO v3/FMA-Large | manuscript-reported |
| Confidence intervals and training details | [Conference §3](https://arxiv.org/html/2602.01645v1#S3) | ICASSP 2026 | manuscript-reported |
| FMA source pools of 95,916 / 5,328 / 5,330 disjoint track IDs per AudioLDM-style target, mixup 0, and checkpoint metadata at step 800,000 | Six original manifest sets, checkpoint metadata, inventory and training configurations | Six AudioLDM-style targets, upstream of the journal audit folds | raw-verified |
| An 800,000-step DiffWave-style FMA run | One checkpoint inventory and its saved training configuration | Local waveform extension | raw-verified for one run |
| Four time coordinates and top-two aggregation, fixed perturbations, and a 200-neighbor local q95 | Journal method drafts and historical configuration | Raw MS / MS-CHN | manuscript-reported, final run alignment unresolved |
| 93 acoustic and 512 CLAP columns in the located export | Feature header, excluding three metadata columns | Extended feature export | raw-verified for the export |
| 87 acoustic and 599 joint features | Earlier feature extraction report | Historical feature export | manuscript-reported dimensions; final feature selection unresolved |
| AudioLDM-style TPR, AUC and empirical FPR, plus neighborhood ablation and diagnostic lift | July 2026 experimental section, primary and ablation tables, Problem Verification subsection, and [journal evidence](../data/journal-evidence.json) | M2/M4/M6 with the earlier calibration-pool description | manuscript-reported, original-label replay unresolved |
| September C_ref/C_thr/E₀/E₁ role counts and two-family design | September 2026 design summary | Separate score-fitting and threshold-calibration pools | unresolved against final fold manifests |
| Embedding NN main result, acoustic-only ablation, DiffWave-style main rows and paired lift reductions in the September summary | September 2026 results summary | Later protocol | unresolved against the underlying manuscript and score files |
| Causal effect of augmentation switches | Matched augmentation-on/off targets and aligned score caches would be needed | Paired controlled training | unresolved |

## Conference scope

Best Baseline is the best of Loss, Trajectory and SecMI. The AUC ± entries are 95% CI half-widths. The paper specifies DeLong for AUC and sample-level bootstrap for TPR. Matched compute applies to the comparison documented in Table 1 and §3.3. The description of DiffWave as an official U-Net in §3.2 conflicts with the [official DiffWave architecture](https://github.com/lmnt-com/diffwave/blob/master/src/diffwave/model.py). The site uses “waveform DDPM” for the conference target. The primary perceptual threshold determines the probe budget. A separate score cutoff defines the membership operating point.

The original and cropped [Figure 2 panels](../assets/figures/figure2-crop-manifest.json) are traceable to the paper. The diagrams on the page and the PGD/bisection walkthrough are conceptual.

## Journal scope

The inspected AudioLDM-style records verify training-source membership at track level. The inventory label 799,999 and the embedded checkpoint step 800,000 refer to the same selected weights. Historical scoring code uses multi-step reverse responses and sums the two largest transformed time coordinates without a positivity clamp. The later positive-only formulation still needs an aligned final scorer and score cache. The paper’s latest independent audit fold design requires its own per-role track lists. The local FMA splits and the checkpoint inventory cannot verify the final twelve-target audit and per-fold disjointness.

The July section reports 16.55% TPR and 0.70% empirical FPR for joint MS-CHN. It describes threshold and local-reference calibration using a common non-member pool. The September summary specifies two separate pools. Its values cannot be assigned to that later protocol until the actual runs, labels and scores are aligned. The July section lists Embedding NN as unavailable and provides no acoustic-only ablation row. Historical score archives include different role assignments and counterfactual relabeling. They do not provide training ground truth or reproduce the final comparison. The website reports traceable draft values with this scope and uses no counterfactual results as experimental evidence.

The journal manuscript title is *Mitigating Musical-Similarity Confounding in Membership Inference for Music Diffusion Models*. Its public author list, review status and publication details await confirmation. The [ICASSP project repository](https://github.com/kaslim/LSA-Probe) contains a README.
