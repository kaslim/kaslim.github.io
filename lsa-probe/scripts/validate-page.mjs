import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");
const app = read("js/app.js");
const i18nSource = read("js/i18n.js");
const evidence = JSON.parse(read("data/evidence.json"));
const en = JSON.parse(read("locales/en.json"));
const zh = JSON.parse(read("locales/zh-CN.json"));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const expected = [
  ["MusicLDM", "MAESTRO", .10, .07, .12, .58, .02, .13, .10, .15, .61, .03, .03, .03],
  ["MusicLDM", "FMA-Large", .08, .05, .10, .56, .01, .14, .10, .16, .59, .02, .06, .03],
  ["DiffWave", "MAESTRO", .12, .09, .15, .63, .02, .20, .16, .24, .67, .02, .08, .04],
  ["DiffWave", "FMA-Large", .11, .08, .14, .62, .02, .18, .14, .22, .66, .02, .07, .04]
];

assert(evidence.records.length === 4, "Evidence must contain exactly four Table 1 rows.");
expected.forEach((values, index) => {
  const r = evidence.records[index];
  const actual = [r.model, r.dataset, r.baseline.tpr, ...r.baseline.ci, r.baseline.auc, r.baseline.auc_std, r.lsa_probe.tpr, ...r.lsa_probe.ci, r.lsa_probe.auc, r.lsa_probe.auc_std, r.delta_tpr, r.delta_auc];
  assert(JSON.stringify(actual) === JSON.stringify(values), `Table 1 row ${index + 1} differs from the audited paper values.`);
});

assert(Math.max(...evidence.records.map((r) => r.lsa_probe.auc)) === .67, "Best AUC must be 0.67.");
assert(Math.max(...evidence.records.map((r) => r.lsa_probe.tpr)) === .20, "Best TPR@1% FPR must be 0.20.");
assert(html.includes("+3–8 pp") && !html.includes("+8%"), "Hero gain must be expressed in percentage points.");

const productionText = [html, app, i18nSource, JSON.stringify(evidence)].join("\n");
const forbidden = [
  "Math.random(", "np.random", "tau = 0.35", "τ = 0.35", "0.881", "Under Review",
  "Peizhuo Zhang", "Ruiqi Sang", "Zhiyong Li", "Yan Tan", "Yi Cai", "Sheng Li",
  "adversarial_costs.json", "roc_curves.json", "budget_ablation.json", "metric_comparison.json", "baselines.json"
];
for (const token of forbidden) assert(!productionText.includes(token), `Forbidden production token found: ${token}`);

const htmlKeys = new Set();
for (const match of html.matchAll(/data-i18n(?:-aria-label|-alt)?="([^"]+)"/g)) htmlKeys.add(match[1]);
for (const key of htmlKeys) {
  assert(Object.hasOwn(en, key), `Missing English translation key: ${key}`);
  assert(Object.hasOwn(zh, key), `Missing Chinese translation key: ${key}`);
}
for (const key of Object.keys(en)) assert(Object.hasOwn(zh, key), `Chinese dictionary missing English key: ${key}`);
for (const key of Object.keys(zh)) assert(Object.hasOwn(en, key), `English dictionary missing Chinese key: ${key}`);

const localRefs = [];
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = match[1];
  if (!ref.startsWith("http") && !ref.startsWith("#") && !ref.startsWith("../")) localRefs.push(ref);
}
for (const ref of localRefs) assert(fs.existsSync(path.join(root, ref)), `Missing local asset: ${ref}`);

for (const relative of [
  "assets/figures/framework.png",
  "assets/figures/stability-schematic.png",
  "assets/figures/figure2-a-low-fpr-roc.png",
  "assets/figures/figure2-b-timestep.png",
  "assets/figures/figure2-c-budget.png",
  "assets/figures/figure2-d-metric.png"
]) {
  assert(fs.statSync(path.join(root, relative)).size > 10_000, `Figure asset is unexpectedly small: ${relative}`);
}

assert((html.match(/data-focus-step="[1-8]"/g) || []).length === 8, "Focus View must expose exactly eight steps.");
assert(!/href="#"/.test(html), "Empty resource links are not allowed.");

if (failures.length) {
  console.error(`LSA-Probe validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("LSA-Probe validation passed:");
console.log("- Table 1: 4/4 exact rows");
console.log("- Best AUC: 0.67; best TPR@1% FPR: 0.20");
console.log("- No production mock/random-data dependencies");
console.log(`- Translation parity: ${Object.keys(en).length} keys`);
console.log(`- Local assets: ${localRefs.length} references resolved`);
console.log("- Focus View: 8 steps");
