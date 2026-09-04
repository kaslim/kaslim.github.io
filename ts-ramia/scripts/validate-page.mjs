import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const data = JSON.parse(read("data/published-results.json"));
const en = JSON.parse(read("locales/en.json"));
const zh = JSON.parse(read("locales/zh.json"));
const html = read("index.html");
const app = read("js/app-v2.js");

function check(condition, message) {
  if (!condition) throw new Error(message);
}

const expected = {
  raw: {
    baseline: [0.730, 1.8, 7.2, 15.4],
    structtail64: [0.780, 3.1, 11.8, 22.6],
    fusion: [0.812, 8.3, 24.1, 38.7]
  },
  matched: {
    baseline: [0.563, 0.9, 3.2, 7.8],
    structtail64: [0.692, 2.4, 9.5, 18.3],
    fusion: [0.826, 14.6, 32.7, 48.2]
  },
  calibrated: {
    baseline: [0.571, 1.0, 3.5, 8.1],
    structtail64: [0.701, 2.6, 9.8, 19.0],
    fusion: [0.818, 13.9, 31.2, 46.8]
  }
};

for (const [view, methods] of Object.entries(expected)) {
  for (const [method, values] of Object.entries(methods)) {
    const actual = data.table1.views[view].methods[method];
    check(actual.auc === values[0], `${view}/${method} AUC mismatch`);
    check(actual.tpr1_percent === values[1], `${view}/${method} TPR1 mismatch`);
    check(actual.tpr5_percent === values[2], `${view}/${method} TPR5 mismatch`);
    check(actual.tpr10_percent === values[3], `${view}/${method} TPR10 mismatch`);
    check(actual.auc >= 0 && actual.auc <= 1, `${view}/${method} invalid AUC`);
    [actual.tpr1_percent, actual.tpr5_percent, actual.tpr10_percent].forEach((value) => check(value >= 0 && value <= 100, `${view}/${method} invalid TPR`));
  }
}

check(data.dataset.maestro.matched_pairs === 313, "Length-matched view must report 313 pairs");
check(data.table1.views.matched.methods.fusion.auc === 0.826, "Default matched Fusion AUC must be 0.826");
check(data.table1.views.matched.methods.fusion.tpr1_percent === 14.6, "Default matched Fusion TPR1 must be 14.6%");
check(data.table2.rows.length === 6, "Table 2 must contain six rows");

const htmlKeys = new Set([...html.matchAll(/data-i18n(?:-aria-label|-alt)?="([^"]+)"/g)].map((match) => match[1]));
for (const key of htmlKeys) {
  check(key in en, `English translation missing: ${key}`);
  check(key in zh, `Chinese translation missing: ${key}`);
}
check(JSON.stringify(Object.keys(en).sort()) === JSON.stringify(Object.keys(zh).sort()), "Locale dictionaries must expose identical keys");

const forbidden = [
  "First Membership Inference Attack on Music Models",
  "First MIA",
  "AUC 0.925",
  "44.2%",
  "Higher scores = Harder to predict = More likely memorized",
  "contact@example.com",
  "@article{ts-ramia2025}",
  "Built with ❤️",
  "Run Attack",
  "Attack successful"
];
for (const phrase of forbidden) check(!html.includes(phrase), `Forbidden production phrase: ${phrase}`);
check(!app.includes("Math.random"), "Production JavaScript must not use Math.random");
check(!html.includes("demo_samples.json") && !html.includes("metrics.json") && !html.includes("roc_curves.json"), "Production page must not load legacy mock JSON");
check(html.includes("data/published-results.json") === false, "Published data is loaded only through the production app");
check(app.includes('fetch("data/published-results.json"'), "Production app must load the single published-results source");
check(html.includes("aaai-slides.html"), "Conference slides link is required");

for (const asset of [
  "assets/figures/figure1-pipeline.png",
  "assets/figures/figure2-combined-cropped.png",
  "assets/figures/figure2d-checkpoint-cropped.png",
  "assets/figures/original-extracts/figure1-embedded-original.png",
  "assets/figures/original-extracts/figure2-page-240dpi.png"
]) check(fs.existsSync(path.join(root, asset)), `Missing paper asset: ${asset}`);

console.log("TS-RaMIA static validation passed");
