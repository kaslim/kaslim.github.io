/* =====================================
   TS-RaMIA AAAI Slides Data
   Updated with exact reported numbers
   ===================================== */

// Slide content structure - 14 slides with visuals
const slidesData = [
    // Slide 1: Title
    {
        id: 1,
        title: "TS-RaMIA",
        subtitle: "Membership Auditing for Symbolic Music Generation Models",
        type: "title",
        bullets: [
            "EAIM @ AAAI 2026 · 15 min talk + 5 min Q&A",
            "Yuxuan Liu, Rui Sang, Peihong Zhang, Zhixin Li, ..."
        ],
        visual: {
            type: "heroParticles",
            badges: ["Music AI", "Privacy Audit", "Symbolic Tokens"]
        },
        notes: "One-sentence hook: 'Creators ask: was my piece used to train this model?'"
    },
    
    // Slide 2: Why now
    {
        id: 2,
        title: "Why creators need auditing now",
        type: "standard",
        bullets: [
            "Training data is scraped and opaque",
            "Copyright and licensing disputes are rising",
            "Auditing needs high precision (low false positives)"
        ],
        visual: {
            type: "flowDiagram",
            flow: ["Dataset", "Model", "Creator?"]
        },
        notes: "Frame this as accountability tooling, not 'hacking'."
    },
    
    // Slide 3: What is MIA
    {
        id: 3,
        title: "What is Membership Inference?",
        type: "standard",
        bullets: [
            "A statistical test: 'Was x in training set?'",
            "Compare member vs non-member signals",
            "We assume teacher forcing logits (gray-box)"
        ],
        visual: {
            type: "hypothesisCard",
            h0: "x ∉ D_train",
            h1: "x ∈ D_train"
        },
        notes: "Explain 'forward-pass only, no gradients'."
    },
    
    // Slide 4: Why naive fails
    {
        id: 4,
        title: "Why naive loss breaks in symbolic music",
        type: "standard",
        bullets: [
            "Tokens are not uniform in function",
            "Structural tokens dominate counts",
            "Mean loss conflates membership with complexity"
        ],
        visual: {
            type: "tokenSplit",
            structural: 60,
            note: 40
        },
        notes: "Key line: 'Averaging dilutes sparse memorization pockets.'"
    },
    
    // Slide 5: Confounders
    {
        id: 5,
        title: "Two confounders that inflate MIAs",
        type: "standard",
        bullets: [
            "Structural length: n_struct",
            "Event density: events per bar",
            "Raw AUC can be misleading"
        ],
        visual: {
            type: "collapseBars",
            data: [
                { label: "Raw baseline AUC", value: 0.730 },
                { label: "Length-matched baseline AUC", value: 0.563 }
            ]
        },
        notes: "Set up why our debias protocol is central."
    },
    
    // Slide 6: Core insight
    {
        id: 6,
        title: "Where the leakage actually happens",
        type: "standard",
        bullets: [
            "Leakage is strongest on structural tokens",
            "Note-only signals are weak / unstable",
            "We focus on structure to audit reliably"
        ],
        visual: {
            type: "ablationMini",
            data: [
                { label: "Structural-only", value: 0.692, color: "#029E73" },
                { label: "Note-only", value: 0.42, color: "#6C757D" }
            ]
        },
        notes: "Say: 'Structure is the skeleton models memorize.'"
    },
    
    // Slide 7: Pipeline
    {
        id: 7,
        title: "TS-RaMIA in one slide",
        type: "standard",
        bullets: [
            "Mask structural tokens",
            "Per-token NLL via teacher forcing",
            "Tail-of-top-k aggregation",
            "Debias + meta-fusion"
        ],
        visual: {
            type: "pipeline",
            stages: [
                { name: "Tokenize", icon: "📝" },
                { name: "Structural\nMask", icon: "🎯" },
                { name: "Token\nNLL", icon: "📊" },
                { name: "Top-k\nTail", icon: "📈" },
                { name: "Debias+\nFusion", icon: "⚖️" }
            ]
        },
        notes: "Emphasize: 'forward-pass only; practical for auditing.'"
    },
    
    // Slide 8: Structural masking
    {
        id: 8,
        title: "Structural masking: isolate the lattice",
        type: "standard",
        bullets: [
            "REMI: Bar / Position / Tempo",
            "ABC: | : [ ] (exclude headers)",
            "Reduces formatting noise"
        ],
        visual: {
            type: "tokenSnippet",
            tokens: [
                { text: "Bar_1", type: "struct" },
                { text: "Position_0", type: "struct" },
                { text: "Note_C", type: "note" },
                { text: "Note_E", type: "note" },
                { text: "Note_G", type: "note" },
                { text: "Bar_2", type: "struct" },
                { text: "Tempo_120", type: "struct" },
                { text: "Note_D", type: "note" }
            ]
        },
        notes: "Mention unit tests briefly (robust tagging)."
    },
    
    // Slide 9: Tail-of-top-k
    {
        id: 9,
        title: "Tail-of-top-k reveals sparse memorization",
        type: "standard",
        bullets: [
            "Mean loss hides spikes",
            "Use Top-64 hardest structural tokens",
            "Tail balances signal vs variance"
        ],
        visual: {
            type: "tailPlot",
            tokens: 40,
            topK: 64
        },
        notes: "Explain 'pockets': rare but high-loss structural positions."
    },
    
    // Slide 10: Debiasing
    {
        id: 10,
        title: "Auditing needs low-FPR evaluation",
        type: "standard",
        bullets: [
            "Length-matched pairs control n_struct",
            "Conditional calibration removes residual length effects",
            "Primary metric: TPR @ 1% FPR"
        ],
        visual: {
            type: "debiasCards",
            methods: [
                { name: "Length-matched", desc: "Pairing by n_struct" },
                { name: "Calibration", desc: "Isotonic regression" }
            ]
        },
        notes: "Remind: false positives are costly for creators."
    },
    
    // Slide 11: Main results
    {
        id: 11,
        title: "Main results (REMI Transformer, MAESTRO)",
        type: "results",
        bullets: [
            "Baseline collapses after debiasing",
            "TS-RaMIA hits 14.6% TPR @ 1% FPR",
            "AUC improves to 0.826 (length-matched)"
        ],
        visual: {
            type: "resultsBarsRoc",
            hasZoom: true
        },
        notes: "Say: 'This is a practical auditing regime, not just AUC.'"
    },
    
    // Slide 12: Ablations
    {
        id: 12,
        title: "What matters (and what doesn't)",
        type: "standard",
        bullets: [
            "k=64 best trade-off (top-k sweep)",
            "Windowed p95 adds small lift",
            "Note-only: unstable / can invert"
        ],
        visual: {
            type: "ablationBars",
            showP95: true
        },
        notes: "Use this to answer reviewer questions quickly."
    },
    
    // Slide 13: Transfer
    {
        id: 13,
        title: "Transfer across representations",
        type: "standard",
        bullets: [
            "Tested on ABC with NotaGen",
            "AUC 0.73, TPR@1%FPR 8.9% (raw)",
            "Not literal membership: distribution shift caveat"
        ],
        visual: {
            type: "transferBridge",
            from: "REMI",
            to: "ABC",
            metrics: { auc: 0.73, tpr1: 8.9 }
        },
        notes: "Be explicit: 'shows method trend transfer, not direct membership.'"
    },
    
    // Slide 14: Takeaways + Q&A
    {
        id: 14,
        title: "Takeaways",
        type: "conclusion",
        bullets: [
            "Music MIAs must be structure-aware",
            "Debiasing is required for credible auditing",
            "Low-FPR results show real leakage exists"
        ],
        visual: {
            type: "takeawaysPanel",
            workflow: [
                "1. Tokenize piece",
                "2. Query logits",
                "3. Compute TS-RaMIA score",
                "4. Compare to non-member reference"
            ],
            questions: [
                "Does this prove copying?",
                "What if APIs don't expose logits?",
                "How to defend?"
            ]
        },
        notes: "End with: 'We release code and protocol.'"
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
    // Calibrated view (optional footnote)
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
    module.exports = { slidesData, performanceData, ablationData, rocData };
}
