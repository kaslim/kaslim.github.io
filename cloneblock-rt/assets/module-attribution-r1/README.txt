R1 NATIVE MODULE SENSITIVITY — PUBLIC WEB SUMMARY

Source: VC_module_attribution_R1_完整实验报告.pdf
Snapshot: 2026-11-21
PDF SHA256: 7b1395f26cdcb38ff04e114b8b26fb2396a55629094053b28428804c6bedc222
Exact values: extracted from the PDF's embedded RESULTS.json. No model execution, new listening, or new scoring was performed for this website update. The public JSON contains scalar results only, not raw embeddings, machine paths, or private operational logs.

WHAT WAS TESTED
One target speaker (p229), one sentence, 0.10 relative valid-activation norm. Identity reference: p229/003. Independent same-speaker scoring anchor: p229/002. VC source content: p231/002. Target text: Ask her to bring these things with her from the store.
Two random directions x positive/negative signs x two generation seeds = eight planned units per module boundary. Perturb the continuous output, not model weights or integer token IDs. Same-seed CLEAN repetition and ZERO controls qualify the probes.

D = 1 - cosine(E(clean_same_seed), E(probe)): embedding movement, without a failure direction.
A = cosine(E(clean_same_seed), E(real_target)) - cosine(E(probe), E(real_target)): positive means target similarity fell, negative means it rose. ECAPA and Resemblyzer are reported separately.

SCOPE AND MISSING RESULTS
Nine mapped architectures, eight with actual probe data. 53 planned sites; 47 probed. 478 generation slots planned; 376 generated. 424 perturbation units planned; 328 executed, 327 automatically eligible. FreeVC produced no output: loading failed first on torchvision and then on webrtcvad. One seed each in VoxCPM2 and Fish failed same-seed reproducibility, blocking 24 probes per model. One Seed-VC generated-Mel unit failed the content gate and is excluded from eligible means, but its measurements remain in the JSON and plots.

AUTOMATIC GATES ARE NOT HUMAN SUCCESS
Finite, nonempty waveform; RMS > 1e-6; WER <= 0.20 and same-seed-clean WER increase <= 0.20; duration ratio within [0.5, 2]. These engineering/content/control gates do not establish naturalness, absence of repetition, human-perceived identity, MOS, or input preservation. R1 performed no listening or MOS assessment. R1 generated audio was deleted after scoring; no R1 clips are presented here. The older OpenVoice waveform examples elsewhere on the page belong to a separate study.

COMPARISON LIMITS
A: single-use reference/content conditions. B: repeated AR/ODE boundaries. C: acoustic/waveform reconstruction. Equal relative norm per call is not equal perceptual or cumulative dose. Keep exact groups and actual invocation counts visible. Do not form a universal module ranking or normalize results to additive contribution percentages. A reconstruction-layer change may include distortion. Internal interventions are not a waveform-only protector and do not prove that an acceptable reference WAV can reach the same conditions.

PLOTS
Prepared from exact saved scalar data with Matplotlib. Dots: executed units. Squares: automatically eligible means. Horizontal lines: observed min/max, not confidence intervals. Open red diamond: executed but automatically ineligible. Model-specific axes rescale; labels use the report's fixed site order. Unknown values are not zero. Rounded table values are for display; results.json retains precision.

ARCHITECTURES
Redrawn from the nine source-correspondence diagrams and module tables in the attached R1 report. The maps describe the fixed local implementation and configuration, not current public main or every model release. Numeric shapes are included only where reported. A/B/C labels mark selected output boundaries, not exhaustive per-layer attribution. Source pages: F5 10; Qwen3 13; OpenVoice 16; CosyVoice3 19; Chatterbox Turbo 22; Seed-VC 25; VoxCPM2 28; Fish S2 31; FreeVC 33.

Credit: Yuxuan Liu and collaborators, VC module attribution study. This is a research explanation and local sensitivity result, not a claim of first inventing random activation interventions or successful general voice protection.
