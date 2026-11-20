import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const html = read("index.html");
const app = read("js/app-v2.js");
const i18nSource = read("js/i18n.js");
const evidence = JSON.parse(read("data/evidence.json"));
const journal = JSON.parse(read("data/journal-evidence.json"));
const cropManifest = JSON.parse(read("assets/figures/figure2-crop-manifest.json"));
const explanationManifest = JSON.parse(read("assets/legacy/lsa-probe-explanation-manifest.json"));
const comparisonManifest = JSON.parse(read("assets/figures/endpoint-vs-lsa-probe-paper-visual-manifest.json"));
const en = JSON.parse(read("locales/en.json"));
const zh = JSON.parse(read("locales/zh-CN.json"));
const failures = [];
const explanatorySvgs = [
  "assets/figures/audit-question-flow.svg",
  "assets/figures/generative-manifold.svg"
];
const comparisonFigures = [
  "assets/figures/endpoint-vs-lsa-probe-paper-visual-en.png",
  "assets/figures/endpoint-vs-lsa-probe-paper-visual-zh.png",
  "assets/figures/endpoint-vs-lsa-probe-paper-visual-mobile-en.png",
  "assets/figures/endpoint-vs-lsa-probe-paper-visual-mobile-zh.png"
];

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
  const actual = [r.model, r.dataset, r.baseline.tpr, ...r.baseline.ci, r.baseline.auc, r.baseline.auc_ci_half_width, r.lsa_probe.tpr, ...r.lsa_probe.ci, r.lsa_probe.auc, r.lsa_probe.auc_ci_half_width, r.delta_tpr, r.delta_auc];
  assert(JSON.stringify(actual) === JSON.stringify(values), `Table 1 row ${index + 1} differs from the audited paper values.`);
});

assert(Math.max(...evidence.records.map((r) => r.lsa_probe.auc)) === .67, "Best AUC must be 0.67.");
assert(Math.max(...evidence.records.map((r) => r.lsa_probe.tpr)) === .20, "Best TPR@1% FPR must be 0.20.");
const conferenceBlocks = [...html.matchAll(/<div class="study-evidence" data-conference-results>([\s\S]*?)<\/table>/g)];
assert(conferenceBlocks.length === 2, "Conference results must appear in both views.");
for (const [block] of conferenceBlocks) {
  assert(block.includes("3–8 percentage points") && block.includes("+8 pp"), "Conference gains must be expressed in percentage points.");
  assert(block.includes("20% (16%–24%) / 0.67 ± 0.02"), "The conference peak and paper-reported intervals must render in both views.");
  assert(!/under review/i.test(block), "The conference result is published.");
}
assert(evidence.source.status === "manuscript-reported" && evidence.source.confidence_intervals.auc.startsWith("DeLong"), "Conference evidence needs its paper provenance and CI method.");
assert(evidence.source.url.endsWith("#S2.T1"), "Conference data must name its independent Table 1 source.");

const journalSource = journal.protocol.source;
assert(journal.schema_version === 1 && journal.protocol.unit === "proportion", "Unexpected journal results schema or units.");
assert(journal.protocol.id !== evidence.source.protocol && journal.protocol.calibration_fpr_target === 0.01, "Journal metadata must describe its separate protocol and calibration target.");
assert(journal.protocol.model_family === "AudioLDM-style" && journal.protocol.split === "heldout", "Journal table must be scoped to its held-out family.");
assert(JSON.stringify(journal.protocol.targets) === JSON.stringify(["M2", "M4", "M6"]), "Unexpected journal targets.");
assert(journal.protocol.development_targets.every((target) => !journal.protocol.targets.includes(target)), "Development and held-out targets must be separate.");
assert(journalSource.status === "manuscript-reported" && journalSource.raw_replay === "unresolved" && journalSource.version.includes("July 2026"), "Journal provenance must reflect the checked version and replay status.");
assert(fs.existsSync(path.join(root, journalSource.public_provenance)), "Missing journal provenance notes.");
assert(journal.tables.main.length === 7 && journal.tables.ablation.length === 4, "Unexpected journal table sizes.");
for (const methods of Object.values(journal.tables)) {
  assert(new Set(methods).size === methods.length, "Repeated method in journal table.");
  for (const method of methods) {
    assert(Object.hasOwn(en, `journal.${method}`) && Object.hasOwn(zh, `journal.${method}`), `Missing journal method translation: ${method}`);
    const row = journal.methods[method];
    for (const field of ["auc", "tpr", "fpr", "worst_fpr"]) {
      const value = row?.[field];
      assert(Number.isFinite(value) && value >= 0 && value <= 1, `Invalid ${field} for ${method}.`);
    }
    assert(row?.worst_fpr >= row?.fpr, `Worst target FPR is below mean for ${method}.`);
  }
}
assert(JSON.stringify(journal.methods.raw) === JSON.stringify({ auc: 0.6267, tpr: 0.0919, fpr: 0.0056, worst_fpr: 0.0090 }), "Raw MS draft row differs from its source.");
assert(JSON.stringify(journal.methods.mschn) === JSON.stringify({ auc: 0.7021, tpr: 0.1655, fpr: 0.0070, worst_fpr: 0.0074 }), "MS-CHN draft row differs from its source.");
assert((html.match(/data-journal-explorer/g) || []).length === 2 && html.includes("7.36 percentage points"), "Journal results and absolute gain must be available in both views.");
assert(app.includes("record.auc.toFixed(4)") && app.includes("formatPercent(value, 2)"), "Journal AUC and rate precision must remain visible.");

const productionText = [html, app, i18nSource, JSON.stringify(evidence), JSON.stringify(journal)].join("\n");
const forbidden = [
  "Math.random(", "np.random", "tau = 0.35", "τ = 0.35", "0.881",
  "Peizhuo Zhang", "Ruiqi Sang", "Zhiyong Li", "Yan Tan", "Yi Cai", "Sheng Li",
  "adversarial_costs.json", "roc_curves.json", "budget_ablation.json", "metric_comparison.json", "baselines.json"
];
for (const token of forbidden) assert(!productionText.includes(token), `Forbidden production token found: ${token}`);
for (const spelling of ["authorised", "authorisation", "destabilise", "generalise", "optimisation", "regularisation", "memorisation", "Defences"]) {
  assert(!`${html}\n${JSON.stringify(en)}`.includes(spelling), `British spelling remains in visible English copy: ${spelling}`);
}

const htmlKeys = new Set();
for (const match of html.matchAll(/data-i18n(?:-aria-label|-alt)?="([^"]+)"/g)) htmlKeys.add(match[1]);
for (const relative of explanatorySvgs) {
  const svg = read(relative);
  for (const match of svg.matchAll(/data-i18n="([^"]+)"/g)) htmlKeys.add(match[1]);
}
for (const relative of comparisonFigures) {
  assert(fs.existsSync(path.join(root, relative)), `Missing finished comparison figure: ${relative}`);
  assert(fs.statSync(path.join(root, relative)).size > 100_000, `Finished comparison PNG is unexpectedly small: ${relative}`);
}
for (const key of htmlKeys) {
  assert(Object.hasOwn(en, key), `Missing English translation key: ${key}`);
  assert(Object.hasOwn(zh, key), `Missing Chinese translation key: ${key}`);
}
for (const key of Object.keys(en)) assert(Object.hasOwn(zh, key), `Chinese dictionary missing English key: ${key}`);
for (const key of Object.keys(zh)) assert(Object.hasOwn(en, key), `English dictionary missing Chinese key: ${key}`);

const localRefs = [];
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert(new Set(ids).size === ids.length, "Duplicate page IDs.");
for (const match of html.matchAll(/\b(?:src|href|data-dialog-image)="([^"]+)"/g)) {
  const ref = match[1];
  if (ref.startsWith("#")) {
    assert(ids.includes(ref.slice(1)), `Broken local anchor: ${ref}`);
  } else if (!ref.startsWith("https://")) {
    localRefs.push(ref.split("?")[0]);
  }
}
for (const ref of localRefs) assert(fs.existsSync(path.join(root, ref)), `Missing local asset: ${ref}`);

for (const relative of [
  "assets/figures/framework.png",
  "assets/figures/stability-schematic.png",
  "assets/figures/figure2-a-low-fpr-roc-cropped.png",
  "assets/figures/figure2-b-timestep-cropped.png",
  "assets/figures/figure2-c-budget-cropped.png",
  "assets/figures/figure2-d-metric-cropped.png"
]) {
  assert(fs.statSync(path.join(root, relative)).size > 10_000, `Figure asset is unexpectedly small: ${relative}`);
}
for (const relative of explanatorySvgs) {
  assert(fs.existsSync(path.join(root, relative)), `Missing explanatory SVG: ${relative}`);
  assert(fs.statSync(path.join(root, relative)).size > 2_000, `Explanatory SVG is unexpectedly small: ${relative}`);
  const png = relative.replace(/\.svg$/, "@2x.png");
  assert(fs.existsSync(path.join(root, png)), `Missing high-resolution PNG fallback: ${png}`);
  assert(fs.statSync(path.join(root, png)).size > 10_000, `PNG fallback is unexpectedly small: ${png}`);
}

const legacyExplanation = path.join(root, "assets/legacy/lsa-probe-explanation-original.png");
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
assert(fs.existsSync(legacyExplanation), "Missing preserved original LSA-Probe explanation image.");
assert(digest(legacyExplanation) === explanationManifest.sha256, "Preserved explanation image hash mismatch.");
assert(comparisonManifest.assets.length === 4, "Comparison manifest must describe four bilingual/responsive assets.");
for (const asset of comparisonManifest.assets) {
  const relative = `assets/figures/${asset.file}`;
  assert(comparisonFigures.includes(relative), `Unexpected comparison asset in manifest: ${asset.file}`);
  assert(digest(path.join(root, relative)) === asset.sha256, `Comparison figure hash mismatch: ${asset.file}`);
}
assert((html.match(/class="comparison-pair"/g) || []).length === 4, "Both views need both comparison pairs.");
const manifoldSvg = read("assets/figures/generative-manifold.svg");
assert(manifoldSvg.includes("svg.manifold.member") && manifoldSvg.includes("svg.manifold.nonmember"), "Archived generative-support figure must show both candidates on the same support region.");

const steps = [...html.matchAll(/data-focus-step="(\d+)"/g)].map((match) => Number(match[1]));
const slides = [...html.matchAll(/data-focus-slide="(\d+)"/g)].map((match) => Number(match[1]));
assert(steps.length === 8 && steps.every((step, i) => step === i + 1 && slides[i] === step) && steps.length === slides.length, "Focus steps and ordinary sections must match in order.");
for (const step of steps) {
  assert(en[`focus.step${step}`] && zh[`focus.step${step}`], `Missing Focus navigation label for step ${step}.`);
}
assert(html.includes(`</span> / ${steps.length} ·`), "Focus default count is stale.");
assert(app.includes("ordinaryAnchorForStep.get") && app.includes("section.scrollIntoView"), "Focus exit must target the matching ordinary section.");
assert(html.includes("js/app-v2.js") && !html.includes('src="js/app.js'), "Production must load the current interaction script.");
assert(!i18nSource.includes("localStorage.getItem"), "A parameterless URL must not inherit language from localStorage.");
assert(app.includes("slide.scrollTop = 0"), "Focus step changes must reset the content scroll position.");
assert(cropManifest.panels.length === 4, "Figure 2 crop manifest must contain four panels.");
for (const panel of cropManifest.panels) {
  const source = path.join(root, panel.source);
  const output = path.join(root, panel.output);
  assert(fs.existsSync(source), `Missing preserved original Figure 2 panel: ${panel.source}`);
  assert(fs.existsSync(output), `Missing cropped Figure 2 panel: ${panel.output}`);
  assert(digest(source) === panel.source_sha256, `Original Figure 2 hash mismatch: ${panel.source}`);
  assert(digest(output) === panel.output_sha256, `Cropped Figure 2 hash mismatch: ${panel.output}`);
  assert(panel.output_size[0] <= panel.source_size[0] && panel.output_size[1] <= panel.source_size[1], `Invalid crop dimensions: ${panel.output}`);
}
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
console.log(`- Focus View: ${steps.length} matched ordinary sections and slides`);
console.log("- Journal: separate draft provenance, main and ablation tables, four-place AUC and two-place percent");
console.log("- Figure 2: 4/4 preserved originals and verified crop hashes");
console.log("- Conceptual comparisons in both views and archived explanation assets verified");
console.log("- User reference image: preserved with verified SHA-256");
console.log("- Parameterless URL language: English fallback independent of localStorage");
