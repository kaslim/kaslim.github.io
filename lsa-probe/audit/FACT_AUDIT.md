# LSA-Probe production fact audit

Audit date: 2026-09-05

Primary source: the five-page ICASSP 2026 paper PDF supplied by the author. Secondary checks used the arXiv record, the official ICASSP 2026 programme entry, and the public project repository.

## 1. Paper facts retained

- Formal title: *Membership Inference Attack Against Music Diffusion Models via Generative Manifold Perturbation*.
- Authors: Yuxuan Liu, Peihong Zhang, Rui Sang, Zhixin Li, Yizhou Tan, Yiqiang Cai, Shengchen Li.
- Affiliation: Xi’an Jiaotong-Liverpool University, Suzhou, China.
- Venue: 2026 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), oral presentation in Information Forensics and Security.
- Threat model: white-box, developer-side or authorised audit with access to parameters, sampler, intermediate states and gradients. Shadow models and labelled target-model members are not required; an independent non-member development set is required for calibration.
- Core score: the minimum time-normalised latent perturbation budget required to reach a fixed perceptual degradation target.
- Time convention: t≈0 is near the clean sample, t≈T is near the high-noise state, and t_ratio=0.6 is the main operating point.

## 2. Paper experiment facts retained

- The production evidence table is a literal transcription of Table 1: four model–dataset rows, confidence intervals, AUC mean±standard deviation and absolute improvements.
- The four production evidence figures are the original embedded raster panels extracted from the supplied PDF without redrawing their contents.
- Main settings: deterministic DDIM, p=2, eta_max=0.8, outer bisection B=10, inner PGD K=12, five restarts, momentum 0.9, alpha=beta*eta/K with beta in [0.2, 0.3], and CDPAM as the primary perceptual metric.
- Statistical protocol: DeLong confidence intervals for AUC; sample-level bootstrap for other operating points; 10,000 resamples; Holm–Bonferroni correction; baselines matched within ±5% compute.

## 3. Real images retained

- `assets/figures/framework.png`: an author-provided high-resolution framework image, checked against Figure 1 in the paper and copied without pixel modification.
- `assets/figures/figure2-*.png`: the four embedded colour panels extracted directly from Figure 2 in the supplied paper PDF.

## 4. Conceptual material

- `assets/figures/stability-schematic.png` is a deterministic explanatory schematic, not a measured sample or digitised experiment. It contains no empirical values and is labelled accordingly.
- `assets/figures/audit-question-flow.svg` is a deterministic audit-flow diagram. It treats the candidate audio and audited model as joint inputs and presents a continuous statistical evidence direction rather than a categorical verdict.
- The endpoint-versus-LSA-Probe explanation is delivered as four finished image assets: English and Chinese desktop SVGs plus English and Chinese mobile SVGs. The production page selects the appropriate complete image; it does not reconstruct this figure from HTML/CSS components.
- The finished comparison removes the source image's repeated spectrograms, crossing arrows, long conclusion paragraphs and illustrative values 0.05/0.06. It retains only the audited scientific relationship: overlapping endpoint evidence versus the minimum time-normalized budget required to reach the same degradation target, with `C_adv(member) > C_adv(non-member)` presented as an empirical tendency.
- `assets/figures/generative-manifold.svg` is a conceptual two-dimensional projection. Both the member and non-member candidate are shown on the same learned support region; the different radii visualize the paper's empirical local-stability interpretation rather than an analytic manifold or universal theorem.
- Each explanatory SVG has a high-resolution PNG fallback for sharing and preview. The comparison is pre-rendered in both languages and in separate desktop/mobile compositions so its labels remain legible without runtime diagram assembly.
- The two-loop walkthrough is deterministic illustrative control flow. It never produces a member/non-member verdict and never presents its symbolic state as an experiment log.

## 4.1 Preserved source explanation

- The user-provided explanation image is preserved byte-for-byte at `assets/legacy/lsa-probe-explanation-original.png`.
- Its provenance record is stored at `assets/legacy/lsa-probe-explanation-manifest.json`.
- The preserved image has SHA-256 `779418010af26c1e3b12db0feb2ac626fea96a47f9fcfef773e4baf859ea4fbc` and dimensions 1601×883 pixels.
- It remains a legacy reference only and is not loaded by the production page.

## 5. Random or mock material removed from production

The legacy generator used seeded NumPy gamma samples and random perturbations to create distributions and ablations. The old page also used JavaScript-generated pseudo-spectrograms, a fixed tau=0.35 reconstruction decision, fabricated per-sample costs, and an unrelated mock AUC around 0.881. These files remain in the hidden archive and Git tag, but the production page does not load them.

## 6. Untraceable or manually entered legacy data

The former `metric_comparison.json`, `baselines.json`, several ROC arrays, budget/timestep series and per-sample member/non-member distributions lacked a provenance manifest or disagreed with Table 1. They are excluded from production evidence.

## 7. Corrected legacy conflicts

- `ICASSP (Under Review)` → `ICASSP 2026 · Oral`.
- Rewritten subtitle → formal paper title.
- Incorrect author spellings → paper author list.
- `+8%` → `+3–8 pp`.
- Reversed diffusion-time explanation → t≈0 clean, t≈T noisy.
- Reconstruction-error threshold verdict → two distinct thresholds: perceptual degradation target tau and a separate membership decision cutoff on C_adv.
- Swapped MusicLDM/DiffWave rows → exact Table 1 ordering and values.
- Fake MIA Demo / random Explorer → evidence-only Table 1 explorer.
- Empty paper/download links → verified arXiv, ICASSP programme and repository links.

## 8. Terminology note

Section 2.3 of the paper defines tau as the perceptual degradation threshold used to obtain C_adv, while one sentence in the experimental setup refers to a “decision threshold” using the same symbol. Figure 1 also visually separates “perceptual threshold tau” from the final membership decision. The production page resolves the ambiguity explicitly: tau sets the degradation target; a distinct cutoff on C_adv sets the membership operating point.

## 9. Claims deliberately not made

- LSA-Probe does not recover an analytic data manifold or prove universal smoothness of all members.
- It is not a remote black-box attack for ordinary users.
- Its best TPR at 1% FPR is 20%; it does not solve membership auditing outright.
- Its score is statistical evidence, not standalone legal proof.
- The public repository does not currently expose a complete implementation, checkpoints or raw per-sample logs.
- The Agent Safety section is a future methodological transfer, not a completed LSA-Probe experiment.
