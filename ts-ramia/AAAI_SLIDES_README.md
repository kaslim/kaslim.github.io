# TS-RaMIA AAAI Oral Slides

## 📊 Overview

This is a web-based presentation system designed for the AAAI 2026 oral presentation of **TS-RaMIA: Membership Auditing for Symbolic Music Models**.

The slides are built with native HTML/CSS/JavaScript + D3.js, providing a PowerPoint-like experience in the browser with full keyboard control and speaker notes.

---

## 🚀 Quick Start

### Local Testing

Simply open the HTML file in your browser:

```bash
cd ts-ramia
open aaai-slides.html  # macOS
# or
xdg-open aaai-slides.html  # Linux
# or double-click in Windows Explorer
```

### Deployment

The slides are automatically deployed with your GitHub Pages site at:
```
https://yourusername.github.io/ts-ramia/aaai-slides.html
```

---

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `Esc` | Show/hide table of contents |
| `N` | Toggle speaker notes panel |
| `F` | Enter/exit fullscreen |
| `Home` | Go to first slide |
| `End` | Go to last slide |
| `1-9` | Jump to slide number |

### Touch/Swipe Support

- Swipe left: Next slide
- Swipe right: Previous slide

---

## 📑 Slide Structure

The presentation contains **14 slides** organized as follows:

1. **Title Slide** - Introduction and authors
2. **Why Now?** - Problem motivation (copyright auditing)
3. **What is MIA?** - Concept explanation
4. **Why Naive Fails** - Token heterogeneity and confounders
5. **Two Confounders** - Structural length + event density
6. **Core Insight** - Structural tokens reveal leakage
7. **Pipeline Overview** - Four-stage method
8. **Tail-of-Top-k** - Why tail beats mean
9. **Debiasing** - Length-matched & calibrated views
10. **Main Results** - Performance on REMI (Table 1)
11. **Ablations** - Negative results and ablation studies
12. **Transfer & Limits** - ABC/NotaGen + limitations
13. **Takeaways** - Three key points
14. **Q&A** - Backup slide with common questions

---

## 🎨 Visual Elements

Each slide can include:

- **Title & Subtitle** - Auto-styled headings
- **Bullet Points** - Animated fade-in (max 4 bullets per slide)
- **Visualizations** - D3.js charts (ROC, bar charts, pipeline diagrams)
- **Speaker Notes** - Hidden by default, accessible via `N` key

### Available Visualizations

The following visual types are implemented in `slides-charts.js`:

- `copyright-icon` - SVG copyright symbol
- `mia-diagram` - Flow diagram of MIA process
- `confounding-collapse` - Bar chart showing AUC collapse
- `confounder-demo` - Icons for confounders
- `token-importance` - ABC notation with highlighted structural tokens
- `pipeline-flow` - Five-stage pipeline flowchart
- `topk-distribution` - Distribution showing tail selection
- `debiasing-views` - Length-matched vs calibrated
- `roc-main` - ROC curve with three methods
- `ablation-bars` - Ablation study results
- `transfer-results` - Transfer to ABC/NotaGen
- `takeaway-checklist` - Checkmarks
- `qa-icon` - Question mark

---

## 📊 Data Configuration

All data is centralized in `js/slides-data.js`:

### Performance Metrics (Table 1)

```javascript
const performanceData = {
    baseline: { auc: 0.563, tpr_1fpr: 0.9, tpr_5fpr: 3.2, tpr_10fpr: 7.8 },
    structtail64: { auc: 0.692, tpr_1fpr: 2.4, tpr_5fpr: 9.5, tpr_10fpr: 18.3 },
    fusion: { auc: 0.826, tpr_1fpr: 14.6, tpr_5fpr: 32.7, tpr_10fpr: 48.2 }
};
```

### ROC Curve Data

ROC curves are defined as arrays of `{fpr, tpr}` points for each method (baseline, structtail64, fusion).

---

## 🎯 Speaker Notes

Each slide has speaker notes stored in the `notes` field of `slidesData`. To view notes:

1. Press `N` to open the notes panel
2. Notes auto-update as you navigate slides
3. Press `N` again or `Esc` to close

Notes are **local only** and not visible to the audience.

---

## 📐 Design Specifications

### Layout
- **Aspect Ratio**: 16:9
- **Container**: 90vw × 90vh (max 1600px × 900px)
- **Padding**: 4rem on all sides

### Typography
- **Font**: Inter (Google Fonts)
- **Title**: 2.5rem, weight 700, color #0173B2
- **Body**: 1.4rem, line-height 1.5
- **Bullets**: Animated fade-in with 0.1s stagger

### Colors (matching TS-RaMIA palette)
- Primary: `#0173B2` (blue)
- Accent: `#DE8F05` (orange)
- Success: `#029E73` (green)
- Text: `#212529` (dark gray)
- Muted: `#6C757D` (gray)

---

## 🔧 Customization

### Adding New Slides

1. Edit `js/slides-data.js`
2. Add a new object to the `slidesData` array:

```javascript
{
    id: 15,
    title: "New Slide Title",
    type: "custom",
    bullets: [
        "First point (≤ 12 words)",
        "Second point",
        "Third point"
    ],
    visual: "custom-visual",
    notes: "Speaker notes for this slide (45-90 seconds of content)"
}
```

3. If adding a new visual type, implement it in `js/slides-charts.js`:

```javascript
case 'custom-visual':
    renderCustomVisual(container);
    break;
```

### Modifying Styles

- Edit `css/slides.css` for layout and typography
- All color variables are defined in `:root`
- Transitions and animations can be adjusted via CSS variables

---

## 🌐 Browser Compatibility

Tested on:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

**Note**: Fullscreen API may have limited support on iOS Safari.

---

## 📱 Mobile/Tablet Support

While optimized for desktop presentation (16:9), the slides are responsive:

- **Tablets**: Grid layouts adapt to single column
- **Mobile**: Touch swipe navigation enabled
- Font sizes scale down on smaller screens

For best presentation experience, use a laptop/desktop with external display or projector.

---

## 🎤 Presentation Tips

### Before Your Talk
1. Press `F` to enter fullscreen
2. Press `N` to open speaker notes (practice mode)
3. Test navigation with arrow keys
4. Verify all visualizations render correctly

### During Your Talk (15 min + 5 min Q&A)
- **Slide 1-2**: 2 min (intro + motivation)
- **Slide 3-4**: 2 min (MIA concept + why naive fails)
- **Slide 5-6**: 2 min (confounders + core insight)
- **Slide 7-9**: 4 min (method details)
- **Slide 10**: 2 min (main results - emphasize low-FPR)
- **Slide 11-12**: 2 min (ablations + transfer)
- **Slide 13**: 1 min (takeaways)
- **Slide 14**: Q&A backup

### Timing Guide
Each slide has speaker notes with suggested talking points for 45-90 seconds.

---

## 🐛 Troubleshooting

### Visualizations Not Rendering
- Check browser console for D3.js errors
- Ensure D3.js CDN is accessible: `https://d3js.org/d3.v7.min.js`
- Clear browser cache and reload

### Keyboard Controls Not Working
- Make sure no input field is focused
- Click anywhere on the slide deck first
- Check browser console for JavaScript errors

### Fullscreen Not Working
- Some browsers block fullscreen API
- Try clicking inside the slide area first
- On iOS Safari, fullscreen is limited by system

### Notes Panel Not Showing
- Press `N` (not case-sensitive)
- Check that `notes-panel` element exists in DOM
- Verify `slides-data.js` has `notes` field for current slide

---

## 📦 File Structure

```
ts-ramia/
├── aaai-slides.html           # Main presentation page
├── css/
│   └── slides.css             # Slide-specific styles
├── js/
│   ├── slides-data.js         # Slide content + data
│   ├── slides.js              # Controller (navigation, TOC, notes)
│   └── slides-charts.js       # D3.js visualizations
└── AAAI_SLIDES_README.md      # This file
```

---

## 🔗 Integration

The slides are integrated into the main site:

1. **Main Portfolio** (`index.html`): "📊 AAAI Slides" button on TS-RaMIA card
2. **TS-RaMIA Demo** (`ts-ramia/index.html`): "📊 Slides" link in navbar

---

## 📝 License & Attribution

Part of the TS-RaMIA project by Yuxuan Liu et al.
For the EAIM Workshop @ AAAI 2026.

---

## 🎯 Acceptance Criteria (Self-Check)

- [x] 12+ slides with logical narrative flow
- [x] Keyboard controls (arrows, Esc, N, F)
- [x] Table of contents (Esc)
- [x] Speaker notes panel (N)
- [x] Fullscreen support (F)
- [x] Progress bar
- [x] Hash routing (`#s=5` for sharing)
- [x] D3.js visualizations (ROC, bars, pipeline)
- [x] Table 1 metrics (length-matched view)
- [x] Responsive 16:9 layout
- [x] Navigation links from main site
- [x] All English content
- [x] Clean, modular code

---

## 🚀 Next Steps (Optional)

### Future Enhancements
1. **Export to PDF**: Add print stylesheet for PDF export
2. **Presenter View**: Dual-screen mode with timer + next slide preview
3. **Slide Thumbnails**: Mini preview in TOC
4. **Laser Pointer**: Virtual pointer with mouse click
5. **Recording Support**: Integrate with screen recording tools

### Assets to Add Later
If you have actual figure images:
1. Place them in `assets/fig/`
2. Update visual rendering in `slides-charts.js`
3. Replace placeholders with `<img>` tags

---

**Happy Presenting! 🎉**

For questions or issues, contact: yuxuan.liu2204@student.xjtlu.edu.cn
