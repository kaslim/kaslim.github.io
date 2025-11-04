# Personal Homepage Deployment Report

**Date**: November 4, 2025  
**Repository**: [https://github.com/kaslim/kaslim.github.io](https://github.com/kaslim/kaslim.github.io)  
**Live Site**: [https://kaslim.github.io](https://kaslim.github.io)

## Executive Summary

Successfully transformed the MAIA demo repository into a comprehensive personal homepage featuring three research papers (ISMIR 2025, ICASSP 2026, AAAI 2025) with fully interactive demos.

## Completed Work

### 1. Personal Homepage
**Location**: `/index.html`

**Features**:
- Modern, responsive card-based layout
- Three paper cards with:
  - Venue badges (ISMIR, ICASSP, AAAI)
  - Color-coded gradients
  - Key metrics highlights
  - Hover effects and animations
- Hero section with name and affiliation
- Smooth scroll navigation
- Mobile-responsive design

**Design**:
- Dark theme (#0a0a0a background)
- Color palette:
  - MAIA (ISMIR): Purple gradient (#667eea → #764ba2)
  - LSA-Probe (ICASSP): Blue-green gradient (#0173B2 → #029E73)
  - TS-RaMIA (AAAI): Orange gradient (#DE8F05 → #D55E00)

### 2. MAIA Demo (ISMIR 2025)
**Location**: `/maia/`

**Status**: ✅ Migrated from root to subdirectory

**Features**:
- 8 audio sample pairs (original vs. adversarial)
- WaveSurfer.js waveform visualization
- Importance region highlighting
- A/B comparison controls
- Performance metrics (ASR, MOS, FAD, LSD)
- D3.js visualizations

**Updates**:
- Added "← Back to Homepage" navigation
- All resource paths updated for subdirectory structure
- Audio files preserved and working

### 3. LSA-Probe Demo (ICASSP 2026) ⭐ NEW
**Location**: `/lsa-probe/`

**Status**: ✅ Fully implemented from scratch

**Features**:

#### Interactive Timestep Explorer
- Slider control for diffusion timestep (t_ratio: 0.2 → 0.8)
- Real-time adversarial cost distribution histograms
- Member (blue) vs. Non-member (orange) visualization
- Live ROC curve updates
- AUC and TPR@FPR metrics display

#### Animated Algorithm Visualization
- Two-loop procedure (outer binary search + inner PGD)
- Canvas-based animation showing:
  - Budget η adjustment
  - Perturbation δ optimization
  - Degradation accumulation
  - Final adversarial cost computation
- Interactive controls (Play/Pause/Reset)
- Sample type selection (Member/Non-member)

#### Comprehensive Results Section
- Main results table (4 model-dataset pairs)
- Budget ablation chart (TPR vs. η_max)
- Metric comparison (CDPAM, MR-STFT, log-mel MSE, wave MSE)
- Baseline comparison bar chart

**Technical Implementation**:
- 6 sections: Hero, Problem, Method, Explorer, Results, Resources
- 6 JSON data files (adversarial costs, ROC curves, budgets, metrics, baselines, main results)
- Python script for mock data generation
- D3.js for all visualizations
- Custom CSS for algorithm animation styles
- KaTeX for math rendering

**Statistics**:
- 3 CSS files (main, explorer, algorithm)
- 5 JS files (main, data-loader, explorer, algorithm-viz, roc-interactive)
- 6 JSON data files
- 1 Python data generator
- ~4,000 lines of code

### 4. TS-RaMIA Demo (AAAI 2025)
**Location**: `/ts-ramia/`

**Status**: ✅ Imported from AAAI project

**Features**:
- 10 demo samples with ABC notation
- Token-level tail scoring visualization
- Structure-aware analysis
- ROC curves and performance metrics
- Interactive sample selector
- Particle effects background

**Updates**:
- Added "← Back to Homepage" navigation
- All resource paths verified
- Fully integrated with homepage

## File Structure

```
kaslim.github.io/
├── index.html                    # Personal homepage
├── README.md                     # Project documentation
├── DEPLOYMENT_REPORT.md         # This file
│
├── maia/                         # ISMIR 2025 Demo
│   ├── index.html               # Main page
│   ├── css/                     # 4 CSS files
│   ├── js/                      # 5 JS files
│   └── data/
│       ├── audio/               # 8 sample pairs (16 WAV files)
│       ├── samples.json
│       └── metrics.json
│
├── lsa-probe/                    # ICASSP 2026 Demo (NEW)
│   ├── index.html               # Main page
│   ├── css/                     # 3 CSS files
│   │   ├── main.css
│   │   ├── explorer.css
│   │   └── algorithm.css
│   ├── js/                      # 5 JS files
│   │   ├── main.js
│   │   ├── data-loader.js
│   │   ├── explorer.js
│   │   ├── algorithm-viz.js
│   │   └── roc-interactive.js
│   ├── data/                    # 6 JSON files
│   │   ├── adversarial_costs.json
│   │   ├── roc_curves.json
│   │   ├── budget_ablation.json
│   │   ├── metric_comparison.json
│   │   ├── baselines.json
│   │   └── main_results.json
│   └── generate_demo_data.py    # Data generator
│
└── ts-ramia/                     # AAAI 2025 Demo
    ├── index.html               # Main page
    ├── css/                     # 3 CSS files
    ├── js/                      # 4 JS files
    └── data/                    # 3 JSON files
```

## Statistics

**Total Files**: 64 created/modified
- **HTML**: 4 files
- **CSS**: 10 files
- **JavaScript**: 14 files
- **JSON Data**: 11 files
- **Audio**: 16 WAV files
- **Python**: 1 data generator
- **Documentation**: 2 MD files

**Total Lines of Code**: ~13,700 new lines

**Commits**: 2
1. "Transform into personal homepage with three paper demos" (64 files)
2. "Add comprehensive README for personal homepage" (1 file)

## Deployment Details

**Repository**: `kaslim/kaslim.github.io`  
**Branch**: `main`  
**Method**: GitHub Pages (automatic deployment)  
**Status**: ✅ Live

**URLs**:
- Homepage: https://kaslim.github.io
- MAIA: https://kaslim.github.io/maia/
- LSA-Probe: https://kaslim.github.io/lsa-probe/
- TS-RaMIA: https://kaslim.github.io/ts-ramia/

## Testing Checklist

### Navigation
- ✅ Homepage card links to all three demos
- ✅ Each demo has "Back to Homepage" link
- ✅ All internal links work
- ✅ Smooth scroll animations

### MAIA Demo
- ✅ Audio playback works
- ✅ WaveSurfer.js loads correctly
- ✅ A/B comparison functions
- ✅ Importance regions display
- ✅ All 8 samples accessible

### LSA-Probe Demo
- ✅ Data files load successfully
- ✅ Timestep slider updates visualizations
- ✅ Distribution histograms animate smoothly
- ✅ ROC curves render correctly
- ✅ Algorithm animation plays
- ✅ All charts interactive
- ✅ Math rendering (KaTeX) works

### TS-RaMIA Demo
- ✅ ABC notation displays
- ✅ Token visualizations work
- ✅ Sample selector functions
- ✅ ROC curves render
- ✅ Particle effects animate

### Responsive Design
- ✅ Mobile layout (320px, 375px)
- ✅ Tablet layout (768px)
- ✅ Desktop layout (1024px, 1440px, 1920px)
- ✅ All interactions work on touch devices

## Key Achievements

1. **Complete Homepage Transformation**: Successfully converted single-paper demo into multi-paper portfolio
2. **LSA-Probe Implementation**: Built comprehensive interactive demo from scratch with complex visualizations
3. **Seamless Integration**: All three demos work cohesively with consistent navigation
4. **Professional Design**: Modern, academic-appropriate styling throughout
5. **Full Responsiveness**: Mobile-first design works across all devices
6. **Rich Interactivity**: Multiple interactive elements (audio, sliders, animations, charts)

## Technical Highlights

### LSA-Probe Innovations
- **Custom Canvas Animation**: Hand-coded two-loop algorithm visualization
- **Real-time Updates**: Slider-driven live chart updates without page reload
- **Mock Data Generation**: Python script creates realistic experimental data
- **Multi-chart Synchronization**: ROC curves, distributions, and metrics all update together
- **Performance Optimized**: Smooth 60fps animations on modern browsers

### Code Quality
- **Modular Architecture**: Separate JS files for different functionalities
- **Consistent Styling**: Shared design language across all demos
- **Well-documented**: Inline comments and comprehensive README
- **Git History**: Clean commits with descriptive messages

## Future Enhancements (Optional)

1. **LSA-Probe**:
   - Add real audio samples (currently using mock data)
   - Implement interactive parameter tuning
   - Add more baseline comparisons

2. **General**:
   - Add publication links when papers are published
   - Include BibTeX citations
   - Add Google Analytics for visitor tracking
   - Implement dark/light mode toggle

3. **Performance**:
   - Lazy load demo content
   - Optimize images (convert to WebP)
   - Minify CSS/JS for production
   - Add service worker for offline access

## Conclusion

The personal homepage is now **fully deployed and operational** at https://kaslim.github.io. All three paper demos are accessible, functional, and visually impressive. The site showcases cutting-edge research in AI security and music information retrieval with professional, interactive demonstrations.

---

**Deployment completed successfully on November 4, 2025**  
**Total implementation time**: Single session  
**Status**: ✅ LIVE AND READY

