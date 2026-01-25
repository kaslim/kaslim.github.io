/* =====================================
   TS-RaMIA AAAI Slides Data
   ===================================== */

// Slide content structure
const slidesData = [
    // Slide 1: Title
    {
        id: 1,
        title: "TS-RaMIA",
        subtitle: "Membership Auditing for Symbolic Music Models",
        type: "title",
        bullets: [
            "Yuxuan Liu, Peizhuo Zhang, Ruibin Sang, Zehua Li, Shijian Li",
            "Xi'an Jiaotong-Liverpool University",
            "EAIM Workshop @ AAAI 2026"
        ],
        notes: "Welcome! 15-min talk. First MIA for symbolic music. Focus: why naive likelihood fails, our structural insight, low-FPR auditing."
    },
    
    // Slide 2: Why now
    {
        id: 2,
        title: "Why This Problem Now?",
        type: "motivation",
        bullets: [
            "Music models trained on scraped corpora",
            "Creators need copyright auditing tools",
            "No existing MIA for symbolic music",
            "Training data transparency matters"
        ],
        visual: "copyright-icon",
        notes: "Context: Large music models use web-scraped data. Composers want to know if their work was used. This is the first membership inference attack for music."
    },
    
    // Slide 3: What is MIA
    {
        id: 3,
        title: "What is Membership Inference Attack?",
        type: "concept",
        bullets: [
            "Hypothesis test: was this sample in training?",
            "Uses model's forward-pass logits/losses",
            "Higher confidence on seen data",
            "Privacy risk indicator for models"
        ],
        visual: "mia-diagram",
        notes: "MIA is a hypothesis test. Models typically have lower loss on training samples. We use this signal to detect membership."
    },
    
    // Slide 4: Why naive fails
    {
        id: 4,
        title: "Why Naive Likelihood Fails in Music",
        type: "problem",
        bullets: [
            "Token heterogeneity: bars vs notes",
            "Length confounding dominates signal",
            "Event density varies widely",
            "Raw AUC 0.679 → after debiasing 0.563"
        ],
        visual: "confounding-collapse",
        notes: "Key insight: music has structural heterogeneity. Naive mean NLL is dominated by confounders like piece length. After controlling for length, baseline collapses."
    },
    
    // Slide 5: Two confounders
    {
        id: 5,
        title: "Two Confounders We Must Control",
        type: "analysis",
        bullets: [
            "Structural length: number of bars/metadata tokens",
            "Event density: notes per structural unit",
            "Both correlate with membership",
            "Require matched sampling & calibration"
        ],
        visual: "confounder-demo",
        notes: "We identified two major confounders: structural token count and note density. Must control both through length-matching and conditional calibration."
    },
    
    // Slide 6: Core insight
    {
        id: 6,
        title: "Core Insight: Leakage is Not Uniform",
        type: "insight",
        bullets: [
            "Structural tokens reveal more leakage",
            "Bars, time/key signatures matter most",
            "Note tokens alone: inverted signal",
            "Mask to structural channel only"
        ],
        visual: "token-importance",
        notes: "Our main finding: memorization is not uniform across token types. Structural tokens (bars, signatures) leak membership. Note-only signals are actually inverted."
    },
    
    // Slide 7: Pipeline
    {
        id: 7,
        title: "TS-RaMIA Pipeline Overview",
        type: "method",
        bullets: [
            "Step 1: Mask to structural tokens",
            "Step 2: Per-token negative log-likelihood",
            "Step 3: Tail-of-top-k aggregation (Top-64)",
            "Step 4: Debias + multi-temperature fusion"
        ],
        visual: "pipeline-flow",
        notes: "Four-stage pipeline. Mask extracts structural channel. Compute per-token NLL. Focus on hardest 64 tokens. Fuse across temperatures with debiasing."
    },
    
    // Slide 8: Tail-of-top-k
    {
        id: 8,
        title: "Tail-of-Top-k: Why Tail Beats Mean",
        type: "method-detail",
        bullets: [
            "Mean aggregation smooths out spikes",
            "Tail (Top-64) captures hardest tokens",
            "Spikes indicate memorization",
            "Robust across temperature variations"
        ],
        visual: "topk-distribution",
        notes: "Why tail? Memorized samples show spikes in NLL on hard tokens. Mean loses this. Top-64 tail preserves the memorization signal."
    },
    
    // Slide 9: Debiasing & metric
    {
        id: 9,
        title: "Debiasing Views & Auditing Metric",
        type: "method-detail",
        bullets: [
            "Length-matched: sample by structural token count",
            "Calibrated: isotonic regression per density bin",
            "Metric: TPR@1%FPR (auditor criterion)",
            "Low false positive rate critical"
        ],
        visual: "debiasing-views",
        notes: "Two debiasing strategies. Length-matched sampling eliminates structural confounding. Calibration adjusts for density. Use TPR@1%FPR: auditors can't tolerate false accusations."
    },
    
    // Slide 10: Main results
    {
        id: 10,
        title: "Main Results on REMI Transformer",
        type: "results",
        bullets: [
            "Baseline (length-matched): AUC 0.563, TPR@1%FPR 0.9%",
            "StructTail-64: AUC 0.692, TPR@1%FPR 2.4%",
            "StructTail+Fusion: AUC 0.826, TPR@1%FPR 14.6%",
            "Low-FPR regime: 32.7% TPR@5%FPR"
        ],
        visual: "roc-main",
        notes: "Our method achieves 0.826 AUC, 14.6% TPR@1%FPR. Massive improvement over baseline. Zoom ROC shows dominance in low-FPR regime critical for auditing."
    },
    
    // Slide 11: Ablations
    {
        id: 11,
        title: "Ablations & Negative Results",
        type: "ablation",
        bullets: [
            "Note-only mask: inverted signal (negative proof)",
            "Structural channel: restores performance",
            "Top-k size ablation: 64 optimal",
            "Temperature fusion: consistent gain"
        ],
        visual: "ablation-bars",
        notes: "Ablations confirm our hypothesis. Note-only mask fails (even inverts). Structural tokens essential. Top-64 size is sweet spot. Fusion helps across all settings."
    },
    
    // Slide 12: Transfer & limits
    {
        id: 12,
        title: "Transfer to ABC/NotaGen & Limitations",
        type: "transfer",
        bullets: [
            "Transfers to ABC notation format",
            "NotaGen: smaller gains (less overfit)",
            "Limitation: not literal membership",
            "Stress test: needs strong memorization"
        ],
        visual: "transfer-results",
        notes: "Method transfers to ABC format. NotaGen shows smaller gains because less memorization. Caveat: this detects strong memorization, not literal membership. Stress test, not proof."
    },
    
    // Slide 13: Takeaways
    {
        id: 13,
        title: "Takeaways",
        type: "conclusion",
        bullets: [
            "First MIA for symbolic music generation",
            "Structural tokens reveal membership leakage",
            "Low-FPR auditing is now feasible",
            "Practical tool for copyright compliance"
        ],
        visual: "takeaway-checklist",
        notes: "Three key takeaways. First, we solved a new problem. Second, structural heterogeneity matters. Third, practical auditing at low FPR is possible. Can be used by creators."
    },
    
    // Slide 14: Q&A backup
    {
        id: 14,
        title: "Q&A",
        type: "qa",
        bullets: [
            "Q: Why not use likelihood ratio?",
            "A: No reference model for music",
            "Q: How to use as an auditor?",
            "A: Set threshold at 1% FPR, flag high-score samples"
        ],
        visual: "qa-icon",
        notes: "Common questions. Likelihood ratio needs reference model (we don't have one). Practical usage: train shadow model, set threshold to control FPR, audit your corpus."
    }
];

// Performance metrics (Table 1 data - length-matched view)
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
    }
};

// ROC curve data (sampled points for visualization)
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { slidesData, performanceData, rocData };
}
