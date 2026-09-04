(() => {
  "use strict";

  const i18n = window.TSRamiaI18n;
  const methodOrder = ["baseline", "structtail64", "fusion"];
  const methodLabels = { baseline: "Baseline", structtail64: "StructTail-64", fusion: "StructTail+Fusion" };
  const viewOrder = ["raw", "matched", "calibrated"];
  const stageContent = {
    mask: ["pipeline.stage1_title", "pipeline.stage1_body", "stage-mask"],
    nll: ["pipeline.stage2_title", "pipeline.stage2_body", "stage-nll"],
    debias: ["pipeline.stage3_title", "pipeline.stage3_body", "stage-debias"],
    tail: ["pipeline.stage4_title", "pipeline.stage4_body", "stage-tail"],
    fusion: ["pipeline.stage5_title", "pipeline.stage5_body", "stage-fusion"]
  };

  const initialParams = new URLSearchParams(window.location.search);
  const initialStep = Number(initialParams.get("step"));

  let data = null;
  let focusMode = initialParams.get("focus") === "1";
  let focusStep = Number.isInteger(initialStep) ? Math.max(1, Math.min(8, initialStep)) : 1;
  let focusView = "matched";
  let selectedStage = "mask";

  function byId(id) { return document.getElementById(id); }
  function number(value, digits = 3) { return Number(value).toFixed(digits); }
  function percent(value) { return `${Number(value).toFixed(1)}%`; }
  function ci(values) { return `[${number(values[0])}, ${number(values[1])}]`; }

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function validatePublishedData(payload) {
    assert(payload?.paper?.volume === 303, "Unexpected PMLR volume");
    assert(payload?.dataset?.maestro?.matched_pairs === 313, "Matched-pair count must be 313");
    assert(payload?.table1?.views?.matched?.methods?.fusion?.auc === 0.826, "Matched fusion AUC must be 0.826");
    assert(payload?.table1?.views?.matched?.methods?.fusion?.tpr1_percent === 14.6, "Matched fusion TPR@1%FPR must be 14.6%");
    assert(payload?.table2?.rows?.length === 6, "Expected six Table 2 rows");
    viewOrder.forEach((view) => methodOrder.forEach((method) => {
      const record = payload.table1.views[view].methods[method];
      assert(record.auc >= 0 && record.auc <= 1, `Invalid AUC for ${view}/${method}`);
      [record.tpr1_percent, record.tpr5_percent, record.tpr10_percent].forEach((value) => {
        assert(value >= 0 && value <= 100, `Invalid TPR for ${view}/${method}`);
      });
    }));
  }

  async function loadData() {
    const response = await fetch("data/published-results.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Published results request failed (${response.status})`);
    const payload = await response.json();
    validatePublishedData(payload);
    data = payload;
  }

  function renderStaticFacts() {
    const views = data.table1.views;
    byId("paper-authors").textContent = data.paper.authors.join(", ");
    byId("trap-raw").textContent = number(views.raw.methods.baseline.auc);
    byId("trap-matched").textContent = number(views.matched.methods.baseline.auc);
    byId("trap-calibrated").textContent = number(views.calibrated.methods.baseline.auc);
    byId("focus-raw-auc").textContent = number(views.raw.methods.baseline.auc);
    byId("focus-matched-auc").textContent = number(views.matched.methods.baseline.auc);

    byId("note-only-auc").textContent = `AUC ${number(data.negative_results.note_only.auc, 2)}`;
    byId("evt-auc").textContent = `AUC ${number(data.negative_results.evt.auc, 2)}`;
    const conversion = data.dataset.abc_conversion;
    byId("abc-success").textContent = `${conversion.successful.toLocaleString()} / ${conversion.attempted.toLocaleString()} (${conversion.success_rate_percent.toFixed(1)}%)`;
    byId("transfer-raw-auc").textContent = number(data.transfer.raw_auc, 2);
    byId("transfer-tpr1").textContent = percent(data.transfer.raw_tpr1_percent);
    byId("transfer-matched-auc").textContent = number(data.transfer.matched_auc, 2);
    byId("transfer-ci").textContent = `95% CI ${ci(data.transfer.matched_auc_ci)}`;
    byId("focus-transfer-auc").textContent = number(data.transfer.raw_auc, 2);
    byId("focus-transfer-tpr").textContent = percent(data.transfer.raw_tpr1_percent);
  }

  function renderTable1() {
    if (!data) return;
    const tbody = document.querySelector("#table1 tbody");
    tbody.replaceChildren();
    viewOrder.forEach((view) => methodOrder.forEach((method, index) => {
      const record = data.table1.views[view].methods[method];
      const row = document.createElement("tr");
      const viewLabel = i18n.t(`evidence.${view}`);
      row.innerHTML = `${index === 0 ? `<th rowspan="3" scope="rowgroup">${viewLabel}${view === "matched" ? " · 313 pairs" : ""}</th>` : ""}<th scope="row">${methodLabels[method]}</th><td>${number(record.auc)} ${ci(record.auc_ci)}</td><td>${percent(record.tpr1_percent)}</td><td>${percent(record.tpr5_percent)}</td><td>${percent(record.tpr10_percent)}</td>`;
      if (view === "matched" && method === "fusion") row.classList.add("highlight-row");
      tbody.append(row);
    }));
  }

  function renderTable2() {
    if (!data) return;
    const tbody = document.querySelector("#table2 tbody");
    tbody.replaceChildren();
    data.table2.rows.forEach((record) => {
      const row = document.createElement("tr");
      row.innerHTML = `<th scope="row">${record.method}</th><td>${number(record.auc)} ± ${number(record.auc_std)}</td><td>${percent(record.tpr1_percent)}</td>`;
      if (record.method === "Top-64") row.classList.add("highlight-row");
      tbody.append(row);
    });
  }

  function renderExplorer() {
    if (!data) return;
    const view = byId("evidence-view").value;
    const method = byId("evidence-method").value;
    const metric = byId("evidence-metric").value;
    const record = data.table1.views[view].methods[method];
    const labels = { auc: "AUC", tpr1_percent: "TPR@1%FPR", tpr5_percent: "TPR@5%FPR", tpr10_percent: "TPR@10%FPR" };
    byId("explorer-metric-label").textContent = labels[metric];
    byId("explorer-primary").textContent = metric === "auc" ? number(record.auc) : percent(record[metric]);
    byId("explorer-ci").textContent = metric === "auc" ? `95% CI ${ci(record.auc_ci)}` : "";
    byId("explorer-auc").textContent = `${number(record.auc)} ${ci(record.auc_ci)}`;
    byId("explorer-tpr1").textContent = percent(record.tpr1_percent);
    byId("explorer-tpr5").textContent = percent(record.tpr5_percent);
    byId("explorer-tpr10").textContent = percent(record.tpr10_percent);
    byId("explorer-view-note").textContent = i18n.t(`view_note.${view}`);
  }

  function renderFocusEvidence() {
    if (!data) return;
    const methods = data.table1.views[focusView].methods;
    const ids = { baseline: ["focus-baseline-auc", "focus-baseline-tpr"], structtail64: ["focus-tail-auc", "focus-tail-tpr"], fusion: ["focus-fusion-auc", "focus-fusion-tpr"] };
    methodOrder.forEach((method) => {
      byId(ids[method][0]).textContent = number(methods[method].auc);
      byId(ids[method][1]).textContent = percent(methods[method].tpr1_percent);
    });
    byId("focus-pairs").textContent = focusView === "matched" ? "313 matched pairs" : i18n.t(`evidence.${focusView}`);
    byId("focus-view-note").textContent = i18n.t(`view_note.${focusView}`);
    document.querySelectorAll("[data-focus-view]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.focusView === focusView)));
  }

  function renderStage() {
    const [titleKey, bodyKey, className] = stageContent[selectedStage];
    byId("stage-title").textContent = i18n.t(titleKey);
    byId("stage-body").textContent = i18n.t(bodyKey);
    byId("figure-highlight").className = `figure-highlight ${className}`;
    document.querySelectorAll("[data-stage]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.stage === selectedStage)));
  }

  function focusName(step) { return i18n.t(`focus.step${step}`); }

  function updateFocusUrl() {
    const url = new URL(window.location.href);
    if (focusMode) {
      url.searchParams.set("focus", "1");
      url.searchParams.set("step", String(focusStep));
    } else {
      url.searchParams.delete("focus");
      url.searchParams.delete("step");
    }
    window.history.replaceState({}, "", url);
  }

  function renderFocus({ moveFocus = false } = {}) {
    document.body.classList.toggle("focus-mode", focusMode);
    byId("focus-controls").hidden = !focusMode;
    byId("focus-stage").hidden = !focusMode;
    document.querySelectorAll("[data-focus-slide]").forEach((slide) => {
      const active = Number(slide.dataset.focusSlide) === focusStep;
      slide.hidden = !active;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      if (active) slide.scrollTop = 0;
    });
    byId("focus-current").textContent = String(focusStep);
    byId("focus-label").textContent = focusName(focusStep);
    byId("focus-prev").disabled = focusStep === 1;
    byId("focus-next").disabled = focusStep === 8;
    const focusText = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    byId("focus-toggle").textContent = focusText;
    byId("focus-toggle").setAttribute("aria-pressed", String(focusMode));
    byId("hero-focus").textContent = i18n.t("controls.focus");
    updateFocusUrl();
    if (moveFocus && focusMode) {
      const title = document.querySelector(`[data-focus-slide="${focusStep}"] h2`);
      requestAnimationFrame(() => title?.focus({ preventScroll: true }));
    }
  }

  function setFocusStep(next, moveFocus = true) {
    focusStep = Math.max(1, Math.min(8, next));
    renderFocus({ moveFocus });
  }

  function toggleFocus() {
    focusMode = !focusMode;
    renderFocus({ moveFocus: focusMode });
    if (!focusMode) requestAnimationFrame(() => byId("overview")?.scrollIntoView({ block: "start" }));
  }

  function closeSections({ restoreFocus = false } = {}) {
    byId("site-header").classList.remove("nav-open");
    byId("sections-toggle").setAttribute("aria-expanded", "false");
    if (restoreFocus) byId("sections-toggle").focus();
  }

  function setupSections() {
    byId("sections-toggle").addEventListener("click", () => {
      const open = !byId("site-header").classList.contains("nav-open");
      byId("site-header").classList.toggle("nav-open", open);
      byId("sections-toggle").setAttribute("aria-expanded", String(open));
      if (open) byId("section-menu").querySelector("a")?.focus();
    });
    byId("section-menu").querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeSections()));
  }

  function setupImageDialog() {
    const dialog = byId("image-dialog");
    const image = byId("dialog-image");
    let returnFocus = null;
    document.querySelectorAll("[data-dialog-image]").forEach((button) => button.addEventListener("click", () => {
      returnFocus = button;
      const source = button.querySelector("img");
      image.src = button.dataset.dialogImage;
      image.alt = source?.alt || "";
      dialog.showModal();
      byId("dialog-close").focus();
    }));
    byId("dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); dialog.close(); });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") { event.preventDefault(); dialog.close(); }
    });
    dialog.addEventListener("close", () => { returnFocus?.focus(); returnFocus = null; });
  }

  function setupInteractions() {
    byId("language-toggle").addEventListener("click", () => i18n.toggle());
    byId("focus-toggle").addEventListener("click", toggleFocus);
    byId("hero-focus").addEventListener("click", toggleFocus);
    byId("focus-prev").addEventListener("click", () => setFocusStep(focusStep - 1));
    byId("focus-next").addEventListener("click", () => setFocusStep(focusStep + 1));
    ["evidence-view", "evidence-method", "evidence-metric"].forEach((id) => byId(id).addEventListener("change", renderExplorer));
    document.querySelectorAll("[data-focus-view]").forEach((button) => button.addEventListener("click", () => { focusView = button.dataset.focusView; renderFocusEvidence(); }));
    document.querySelectorAll("[data-stage]").forEach((button) => button.addEventListener("click", () => { selectedStage = button.dataset.stage; renderStage(); }));
    byId("copy-citation").addEventListener("click", async () => {
      const citation = byId("citation").innerText;
      let copied = false;
      try {
        await navigator.clipboard.writeText(citation);
        copied = true;
      } catch (_) {
        const fallback = document.createElement("textarea");
        fallback.value = citation;
        fallback.setAttribute("readonly", "");
        fallback.style.position = "fixed";
        fallback.style.opacity = "0";
        document.body.appendChild(fallback);
        fallback.select();
        copied = document.execCommand("copy");
        fallback.remove();
      }
      if (copied) {
        byId("copy-citation").textContent = i18n.t("controls.copied");
        window.setTimeout(() => { byId("copy-citation").textContent = i18n.t("controls.copy"); }, 1400);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && byId("site-header").classList.contains("nav-open")) { event.preventDefault(); closeSections({ restoreFocus: true }); return; }
      if (!focusMode || document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") { event.preventDefault(); toggleFocus(); return; }
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "A"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowLeft") setFocusStep(focusStep - 1);
      if (event.key === "ArrowRight") setFocusStep(focusStep + 1);
      if (event.key === "Home") setFocusStep(1);
      if (event.key === "End") setFocusStep(8);
    });

    let touchStartX = null;
    document.addEventListener("touchstart", (event) => { if (focusMode && !document.querySelector("dialog[open]")) touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    document.addEventListener("touchend", (event) => {
      if (!focusMode || touchStartX === null || document.querySelector("dialog[open]")) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) >= 60) setFocusStep(focusStep + (delta < 0 ? 1 : -1));
    }, { passive: true });
  }

  function setupFocusFromUrl() {
    const params = new URLSearchParams(window.location.search);
    focusMode = params.get("focus") === "1";
    const requested = Number(params.get("step"));
    if (Number.isInteger(requested)) focusStep = Math.max(1, Math.min(8, requested));
    renderFocus();
  }

  window.addEventListener("ts-language-change", () => {
    renderExplorer();
    renderTable1();
    renderTable2();
    renderFocusEvidence();
    renderStage();
    renderFocus();
  });

  async function initialize() {
    await i18n.initialise();
    setupSections();
    setupImageDialog();
    setupInteractions();
    setupFocusFromUrl();
    try {
      await loadData();
      renderStaticFacts();
      renderTable1();
      renderTable2();
      renderExplorer();
      renderFocusEvidence();
      renderStage();
      if (!focusMode && window.location.hash) {
        window.requestAnimationFrame(() => {
          const target = document.querySelector(window.location.hash);
          if (!target) return;
          const root = document.documentElement;
          const previousBehavior = root.style.scrollBehavior;
          root.style.scrollBehavior = "auto";
          target.scrollIntoView({ block: "start" });
          root.style.scrollBehavior = previousBehavior;
        });
      }
    } catch (error) {
      console.error("[TS-RaMIA published data]", error);
      byId("data-error").hidden = false;
      byId("explorer-output").hidden = true;
    }
  }

  initialize().catch((error) => console.error("[TS-RaMIA initialize]", error));
})();
