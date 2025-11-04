# Yuxuan Liu's Research Portfolio

This repository hosts a personal homepage showcasing three research papers with interactive demos.

**Live Site**: [https://kaslim.github.io](https://kaslim.github.io)

## Structure

```
kaslim.github.io/
├── index.html          # Personal homepage with paper cards
├── maia/              # ISMIR 2025: MAIA Demo
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/audio/    # Audio samples for adversarial attacks
├── lsa-probe/         # ICASSP 2026: LSA-Probe Demo
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/          # Mock experimental data
└── ts-ramia/          # AAAI 2025: TS-RaMIA Demo
    ├── index.html
    ├── css/
    ├── js/
    └── data/
```

## Papers

### 1. MAIA (ISMIR 2025)
**Music Adversarial Inpainting Attack**

Importance-driven adversarial attacks via music inpainting for MIR systems.

- **Demo**: [/maia/](https://kaslim.github.io/maia/)
- **Features**: 8 audio sample pairs with waveform visualization
- **Metrics**: 92.8% ASR, MOS 4.0/5

### 2. LSA-Probe (ICASSP 2026)
**Latent Stability Adversarial Probe**

Membership inference for music diffusion models via generative manifold perturbation.

- **Demo**: [/lsa-probe/](https://kaslim.github.io/lsa-probe/)
- **Features**: 
  - Interactive timestep slider
  - Live adversarial cost distributions
  - Animated two-loop algorithm visualization
  - ROC curves with real-time updates
- **Metrics**: TPR@1%FPR +8%, AUC 0.67

### 3. TS-RaMIA (AAAI 2025)
**Token-Structure-Aware Membership Inference**

Structure-aware membership inference attacks for music generation models.

- **Demo**: [/ts-ramia/](https://kaslim.github.io/ts-ramia/)
- **Features**: 10 demo samples with ROC visualizations
- **Metrics**: 94.5% TPR@5%FPR

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Visualizations**: D3.js v7
- **Audio**: WaveSurfer.js v7 (MAIA)
- **Math**: KaTeX (LSA-Probe)
- **Hosting**: GitHub Pages

## Local Development

```bash
# Clone repository
git clone https://github.com/kaslim/kaslim.github.io.git
cd kaslim.github.io

# Start local server
python -m http.server 8000

# Visit http://localhost:8000
```

## Deployment

The site is automatically deployed via GitHub Pages from the `main` branch.

Any push to `main` will trigger a rebuild (typically takes 1-2 minutes).

## Data Generation

### LSA-Probe Mock Data

```bash
cd lsa-probe
python generate_demo_data.py
```

Generates:
- `adversarial_costs.json`: Cost distributions for members/non-members
- `roc_curves.json`: ROC data for different timesteps
- `budget_ablation.json`: Performance vs. budget
- `metric_comparison.json`: Different distance metrics
- `baselines.json`: Baseline method comparisons
- `main_results.json`: Main experimental results

## Author

**Yuxuan Liu**  
PhD Candidate  
Xi'an Jiaotong-Liverpool University

- GitHub: [@kaslim](https://github.com/kaslim)
- Email: yuxuan.liu2204@student.xjtlu.edu.cn

## License

© 2025 Yuxuan Liu. All rights reserved.

The code for these demos is provided for academic and research purposes.
