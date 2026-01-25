/* =====================================
   TS-RaMIA AAAI Slides Data
   18 slides with BIG fonts for in-room readability
   Updated narrative: MIA concept-heavy front-loading
   ===================================== */

// Slide content structure - 18 slides
const slidesData = [
    // Slide 1: Title (layout-center)
    {
        id: 1,
        title: "TS-RaMIA",
        subtitle: "Membership Auditing for Symbolic Music Generation Models",
        type: "title",
        layout: "center",
        bullets: [
            "EAIM @ AAAI 2026 · 15 min + 5 min Q&A",
            "Forward-pass only · Structural-token leakage"
        ],
        callouts: ["Music AI", "Privacy Audit", "First MIA for Symbolic Music"],
        visual: {
            type: "heroTokenStream"
        },
        notes: "Hook: 'Creators ask: Was my piece used to train this model?'"
    },
    
    // Slide 2: The creator's question (layout-split)
    {
        id: 2,
        title: "The creator's question",
        layout: "split",
        bullets: [
            "Training sets are scraped and opaque",
            "Licensing disputes need evidence",
            "Auditing must minimize false accusations"
        ],
        visual: {
            type: "creatorPipeline"
        },
        notes: "Position as accountability tooling, not 'attack for harm'."
    },
    
    // Slide 3: What is MIA (layout-split)
    {
        id: 3,
        title: "What is membership inference (MIA)?",
        layout: "split",
        bullets: [
            "A hypothesis test: 'Was x in training?'",
            "Output is a risk score s(x)",
            "Decision uses a threshold at low FPR"
        ],
        visual: {
            type: "hypothesisTestCard"
        },
        notes: "Stress 'statistical evidence, not a legal verdict'."
    },
    
    // Slide 4: What MIA is NOT (layout-split)
    {
        id: 4,
        title: "What MIA is NOT",
        layout: "split",
        bullets: [
            "Not plagiarism detection",
            "Not data extraction",
            "Not similarity search"
        ],
        visual: {
            type: "vennNot"
        },
        notes: "This prevents misinterpretation early."
    },
    
    // Slide 5: Why music needs MIA (layout-2row)
    {
        id: 5,
        title: "Why music generation needs MIA",
        layout: "2row",
        bullets: [
            "Music is copyrighted creative work",
            "Symbolic corpora are easy to scrape",
            "Auditors need sample-level answers"
        ],
        visual: {
            type: "musicModalityContrast"
        },
        notes: "Explain why symbolic is special: hierarchical grammar + style."
    },
    
    // Slide 6: Threat model (layout-split)
    {
        id: 6,
        title: "Threat model we assume",
        layout: "split",
        bullets: [
            "Auditor has teacher-forcing log-probs",
            "No gradients, no weights, no training data",
            "Gray-box but practical for many checkpoints/APIs"
        ],
        visual: {
            type: "accessModel"
        },
        notes: "Say: 'Forward-pass only makes it feasible.'"
    },
    
    // Slide 7: Why naive fails (layout-split)
    {
        id: 7,
        title: "Why naïve loss fails in symbolic music",
        layout: "split",
        bullets: [
            "Tokens are not functionally uniform",
            "Structural tokens dominate counts",
            "Mean loss confounds membership with complexity"
        ],
        visual: {
            type: "tokenHeterogeneity"
        },
        notes: "Key line: 'Averaging dilutes sparse signals.'"
    },
    
    // Slide 8: Two confounders (layout-2row)
    {
        id: 8,
        title: "Two confounders we must control",
        layout: "2row",
        bullets: [
            "Structural length n_struct",
            "Event density (events per bar)",
            "Raw AUC can look 'good' by accident"
        ],
        callouts: ["Don't trust raw scores"],
        visual: {
            type: "confounderCollapse"
        },
        notes: "This slide justifies debiasing as mandatory."
    },
    
    // Slide 9: Core insight (layout-split-reverse)
    {
        id: 9,
        title: "Core insight",
        layout: "split-reverse",
        bullets: [
            "Leakage concentrates on structural tokens",
            "Structure is the phrasing skeleton",
            "So we audit structure, not uniform tokens"
        ],
        visual: {
            type: "structuralLeakageIntuition"
        },
        notes: "Give an intuitive example: bar boundaries, tempo changes."
    },
    
    // Slide 10: Pipeline overview (layout-2row)
    {
        id: 10,
        title: "TS-RaMIA overview",
        layout: "2row",
        bullets: [
            "Mask structural tokens",
            "Per-token NLL (teacher forcing)",
            "Tail-of-top-k + debiasing",
            "Lightweight meta-fusion"
        ],
        visual: {
            type: "pipeline5"
        },
        notes: "Emphasize: 'Practical auditing pipeline.'"
    },
    
    // Slide 11: Structural masking (layout-split)
    {
        id: 11,
        title: "Step 1 — Structural masking",
        layout: "split",
        bullets: [
            "REMI: Bar / Position / Tempo",
            "ABC: | : [ ] (exclude headers)",
            "Removes formatting noise"
        ],
        visual: {
            type: "tokenSnippetHighlight"
        },
        notes: "Mention unit tests briefly ('robust tagging')."
    },
    
    // Slide 12: Per-token NLL (layout-split)
    {
        id: 12,
        title: "Step 2 — Per-token NLL",
        layout: "split",
        bullets: [
            "Teacher forcing gives token-level surprisal",
            "Chunk long sequences to avoid boundary artifacts",
            "We analyze tokens, not whole-seq perplexity"
        ],
        visual: {
            type: "tokenNLLBars"
        },
        notes: "Explain why per-token is needed for heterogeneity."
    },
    
    // Slide 13: Tail-of-top-k (layout-split)
    {
        id: 13,
        title: "Step 3 — Tail-of-top-k (Top-64)",
        layout: "split",
        bullets: [
            "Mean hides localized 'pockets'",
            "Tail focuses on hardest structural positions",
            "Score direction is unified in fusion"
        ],
        visual: {
            type: "tailExplain"
        },
        notes: "Be explicit: we don't assume 'members always lower loss'."
    },
    
    // Slide 14: Debiasing (layout-2row)
    {
        id: 14,
        title: "Step 4 — Debiasing for credible auditing",
        layout: "2row",
        bullets: [
            "Length-matched pairs control n_struct",
            "Conditional calibration removes residual length effects",
            "Primary endpoint: TPR @ 1% FPR"
        ],
        callouts: ["Low-FPR auditing"],
        visual: {
            type: "debiasTwoCards"
        },
        notes: "Explain why low-FPR matters for creators."
    },
    
    // Slide 15: Meta-attacker fusion (layout-split)
    {
        id: 15,
        title: "Step 5 — Meta-attacker fusion",
        layout: "split",
        bullets: [
            "Combine multiple tail statistics",
            "Logistic regression (lightweight)",
            "Composer-stratified CV for fair generalization"
        ],
        visual: {
            type: "cvComposerDiagram"
        },
        notes: "Preempt 'leakage via composer style' concern."
    },
    
    // Slide 16: Main results (layout-2row) **KEY SLIDE**
    {
        id: 16,
        title: "Main results (REMI Transformer, MAESTRO)",
        layout: "2row",
        type: "results",
        bullets: [
            "Baseline collapses after debiasing",
            "TS-RaMIA reaches 14.6% TPR @ 1% FPR",
            "AUC improves to 0.826 (length-matched)"
        ],
        visual: {
            type: "resultsDashboard",
            hasZoom: true
        },
        notes: "Say: 'This is the regime auditors care about.'"
    },
    
    // Slide 17: Ablations (layout-split)
    {
        id: 17,
        title: "Ablations & negative results",
        layout: "split",
        bullets: [
            "Top-64 best trade-off",
            "+windowed p95 gives small lift",
            "Note-only is unstable (can invert)"
        ],
        callouts: ["Structural tokens dominate leakage"],
        visual: {
            type: "ablationBars"
        },
        notes: "This addresses reviewer-style questions fast."
    },
    
    // Slide 18: Transfer & Takeaways (layout-2row)
    {
        id: 18,
        title: "Transfer, limitations, and takeaways",
        layout: "2row",
        type: "conclusion",
        bullets: [
            "ABC / NotaGen shows representation-transfer trend",
            "Not literal membership (distribution shift caveat)",
            "Takeaways: structure-aware + debiasing + low-FPR"
        ],
        visual: {
            type: "transferAndWorkflow"
        },
        notes: "End: 'Code + protocol released.'"
    }
];

// Performance metrics (exact reported numbers - length-matched view)
const performanceData = {
    baseline: {
        auc: 0.563,
        tpr_1fpr: 0.9,
        tpr_5fpr: 3.2,
        tpr_10fpr: 7.8
    },
    structtail64: {
        auc: 0.692,
        tpr_1fpr: 2.4,
        tpr_5fpr: 9.5,
        tpr_10fpr: 18.3
    },
    fusion: {
        auc: 0.826,
        tpr_1fpr: 14.6,
        tpr_5fpr: 32.7,
        tpr_10fpr: 48.2
    },
    fusionCalibrated: {
        auc: 0.818,
        tpr_1fpr: 13.9
    }
};

// Ablation data (length-matched)
const ablationData = {
    topK: [
        { k: 32, auc: 0.678, tpr_1fpr: 2.1 },
        { k: 64, auc: 0.692, tpr_1fpr: 2.4 },
        { k: 96, auc: 0.685, tpr_1fpr: 2.3 },
        { k: 128, auc: 0.670, tpr_1fpr: 2.0 }
    ],
    p95: {
        auc: 0.709,
        tpr_1fpr: 3.2
    }
};

// ROC curve data (sampled points)
const rocData = {
    baseline: [
        {fpr: 0, tpr: 0},
        {fpr: 0.01, tpr: 0.009},
        {fpr: 0.05, tpr: 0.032},
        {fpr: 0.10, tpr: 0.078},
        {fpr: 0.20, tpr: 0.168},
        {fpr: 0.30, tpr: 0.267},
        {fpr: 0.40, tpr: 0.372},
        {fpr: 0.50, tpr: 0.483},
        {fpr: 0.60, tpr: 0.595},
        {fpr: 0.70, tpr: 0.706},
        {fpr: 0.80, tpr: 0.814},
        {fpr: 0.90, tpr: 0.918},
        {fpr: 1.0, tpr: 1.0}
    ],
    structtail64: [
        {fpr: 0, tpr: 0},
        {fpr: 0.01, tpr: 0.024},
        {fpr: 0.05, tpr: 0.095},
        {fpr: 0.10, tpr: 0.183},
        {fpr: 0.20, tpr: 0.342},
        {fpr: 0.30, tpr: 0.476},
        {fpr: 0.40, tpr: 0.589},
        {fpr: 0.50, tpr: 0.691},
        {fpr: 0.60, tpr: 0.778},
        {fpr: 0.70, tpr: 0.853},
        {fpr: 0.80, tpr: 0.916},
        {fpr: 0.90, tpr: 0.965},
        {fpr: 1.0, tpr: 1.0}
    ],
    fusion: [
        {fpr: 0, tpr: 0},
        {fpr: 0.01, tpr: 0.146},
        {fpr: 0.05, tpr: 0.327},
        {fpr: 0.10, tpr: 0.482},
        {fpr: 0.20, tpr: 0.653},
        {fpr: 0.30, tpr: 0.751},
        {fpr: 0.40, tpr: 0.821},
        {fpr: 0.50, tpr: 0.872},
        {fpr: 0.60, tpr: 0.913},
        {fpr: 0.70, tpr: 0.944},
        {fpr: 0.80, tpr: 0.968},
        {fpr: 0.90, tpr: 0.985},
        {fpr: 1.0, tpr: 1.0}
    ]
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { slidesData, performanceData, ablationData, rocData };
}
