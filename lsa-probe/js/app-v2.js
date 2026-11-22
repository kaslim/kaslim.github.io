(() => {
  "use strict";

  const i18n = window.LSAI18n;
  const focusStage = document.querySelector("#main");
  const focusSlides = [...focusStage.querySelectorAll("[data-focus-step]")];
  const focusControls = document.querySelector("#focus-controls");
  const focusToggle = document.querySelector("#focus-toggle");
  const focusCurrent = document.querySelector("#focus-current");
  const focusLabel = document.querySelector("#focus-label");
  const focusPrev = document.querySelector("#focus-prev");
  const focusNext = document.querySelector("#focus-next");
  const modelSelect = document.querySelector("#model-select");
  const datasetSelect = document.querySelector("#dataset-select");
  const unitToggle = document.querySelector("#unit-toggle");
  const evidenceError = document.querySelector("#evidence-error");
  const focusCount = focusSlides.length;

  let focusMode = false;
  let focusStep = 1;
  let evidence = [];
  let percentageMode = true;
  let journalEvidence;
  let journalLoadFailed = false;
  const ordinaryAnchorForStep = new Map(
    focusSlides.map((section) => [Number(section.dataset.focusStep), section])
  );

  function inferFocusStep() {
    const marker = window.scrollY + Math.min(window.innerHeight * 0.38, 280);
    let inferred = 1;
    for (const section of focusSlides) {
      if (section.offsetTop <= marker) inferred = Number(section.dataset.focusStep);
    }
    return inferred;
  }

  function focusName(step) {
    return i18n.t(`focus.step${step}`);
  }

  function updateUrlForFocus({ setAnchor = false } = {}) {
    const url = new URL(window.location.href);
    if (focusMode) {
      url.hash = "";
      url.searchParams.set("focus", "1");
      url.searchParams.set("step", String(focusStep));
    } else {
      url.searchParams.delete("focus");
      url.searchParams.delete("step");
      if (setAnchor) url.hash = ordinaryAnchorForStep.get(focusStep).id;
    }
    window.history.replaceState({}, "", url);
  }

  function renderFocus({ moveFocus = false, setAnchor = false } = {}) {
    document.body.classList.toggle("focus-mode", focusMode);
    focusControls.hidden = !focusMode;

    focusSlides.forEach((slide) => {
      const active = Number(slide.dataset.focusStep) === focusStep;
      slide.classList.toggle("is-active", focusMode && active);
      slide.hidden = focusMode && !active;

      if (focusMode && active) slide.scrollTop = 0;
    });

    focusCurrent.textContent = String(focusStep);
    focusLabel.textContent = focusName(focusStep);
    focusPrev.disabled = focusStep === 1;
    focusNext.disabled = focusStep === focusCount;
    focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    focusToggle.setAttribute("aria-pressed", String(focusMode));
    updateUrlForFocus({ setAnchor });

    if (moveFocus && focusMode) {
      const heading = ordinaryAnchorForStep.get(focusStep).querySelector("h1, h2");
      window.requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
    }
  }

  function setFocusStep(nextStep, moveFocus = true) {
    focusStep = Math.max(1, Math.min(focusCount, nextStep));
    renderFocus({ moveFocus });
  }

  function toggleFocus() {
    const leavingStep = focusStep;
    if (!focusMode) {
      closeSectionsMenu();
      focusStep = inferFocusStep();
    }
    focusMode = !focusMode;
    renderFocus({ moveFocus: focusMode, setAnchor: !focusMode });
    if (!focusMode) {
      const section = ordinaryAnchorForStep.get(leavingStep);
      window.requestAnimationFrame(() => {
        section.scrollIntoView({ block: "start" });
        const heading = section.querySelector("h1, h2");
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      });
    }
  }

  function formatPercent(value, digits) {
    return (value * 100).toFixed(digits) + "%";
  }

  function formatProportion(value) {
    return percentageMode ? formatPercent(value, 0) : value.toFixed(2);
  }

  function formatTprGain(value) {
    return percentageMode ? `+${(value * 100).toFixed(0)} pp` : `+${value.toFixed(2)}`;
  }

  function renderExplorer() {
    if (!evidence.length) return;
    const record = evidence.find((item) => item.model === modelSelect.value && item.dataset === datasetSelect.value);
    if (!record) {
      evidenceError.hidden = false;
      return;
    }
    evidenceError.hidden = true;
    const baseline = record.baseline;
    const lsa = record.lsa_probe;
    document.querySelector("#baseline-tpr").textContent = formatProportion(baseline.tpr);
    document.querySelector("#lsa-tpr").textContent = formatProportion(lsa.tpr);
    document.querySelector("#delta-tpr").textContent = formatTprGain(record.delta_tpr);
    document.querySelector("#baseline-detail").textContent = i18n.t("explorer.tpr_detail", {
      low: formatProportion(baseline.ci[0]), high: formatProportion(baseline.ci[1]), auc: baseline.auc.toFixed(2), ci: baseline.auc_ci_half_width.toFixed(2)
    });
    document.querySelector("#lsa-detail").textContent = i18n.t("explorer.tpr_detail", {
      low: formatProportion(lsa.ci[0]), high: formatProportion(lsa.ci[1]), auc: lsa.auc.toFixed(2), ci: lsa.auc_ci_half_width.toFixed(2)
    });
    document.querySelector("#delta-detail").textContent = i18n.t("explorer.delta_detail", {
      tpr: formatTprGain(record.delta_tpr), auc: `+${record.delta_auc.toFixed(2)}`
    });
    unitToggle.textContent = i18n.t(percentageMode ? "explorer.show_decimal" : "explorer.show_percent");
  }

  async function loadEvidence() {
    try {
      const response = await fetch("data/evidence.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Evidence request failed (${response.status})`);
      const payload = await response.json();
      if (!Array.isArray(payload.records) || payload.records.length !== 4) throw new Error("Unexpected evidence schema");
      evidence = payload.records;
      renderExplorer();
    } catch (error) {
      console.error("[LSA-Probe evidence]", error);
      evidenceError.hidden = false;
      document.querySelector("#explorer-output").hidden = true;
    }
  }

  const journalExplorers = [...document.querySelectorAll("[data-journal-explorer]")];

  function renderJournal(panel) {
    const status = panel.querySelector("[data-journal-status]");
    if (journalLoadFailed) status.textContent = i18n.t("journal.error");
    if (!journalEvidence) return;
    const tableKey = panel.querySelector("select").value;
    const body = panel.querySelector("tbody");
    const rows = journalEvidence.tables[tableKey].map((method) => {
      const record = journalEvidence.methods[method];
      const row = document.createElement("tr");
      row.classList.toggle("result-highlight", method === "raw" || method === "mschn");
      const label = document.createElement("th");
      label.scope = "row";
      label.textContent = i18n.t(`journal.${method}`);
      row.append(label);
      for (const metric of [record.auc.toFixed(4), ...[record.tpr, record.fpr, record.worst_fpr].map((value) => formatPercent(value, 2))]) {
        const cell = document.createElement("td");
        cell.textContent = metric;
        row.append(cell);
      }
      return row;
    });
    body.replaceChildren(...rows);
    status.hidden = true;
    panel.querySelector(".journal-table").hidden = false;
  }

  async function loadJournal() {
    try {
      const response = await fetch("data/journal-evidence.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Journal evidence request failed (${response.status})`);
      const payload = await response.json();
      if (payload.schema_version !== 1) throw new Error("Unexpected journal evidence schema");
      journalEvidence = payload;
    } catch (error) {
      journalLoadFailed = true;
      console.error("[LSA-Probe journal evidence]", error);
    }
    journalExplorers.forEach(renderJournal);
  }

  const phoneFigure = window.matchMedia("(max-width: 680px)");

  function refreshFigures() {
    const language = i18n.language === "zh-CN" ? "zh" : "en";
    for (const picture of document.querySelectorAll("picture[data-plate]")) {
      const root = "assets/figures/visual-v2/" + picture.dataset.plate;
      const desktop = root + "-" + language + ".svg";
      const mobile = root + "-mobile-" + language + ".svg";
      picture.querySelector("source").setAttribute("srcset", mobile);
      picture.querySelector("img").setAttribute("src", desktop);
      picture.closest("a").href = phoneFigure.matches ? mobile : desktop;
    }
  }

  function setupImageDialog() {
    const dialog = document.querySelector("#image-dialog");
    const image = document.querySelector("#dialog-image");
    const download = document.querySelector("#dialog-download");
    const zoom = document.querySelector("#dialog-zoom");
    const pane = dialog.querySelector(".figure-pan");
    let opener;
    function setZoom(enlarged) {
      pane.classList.toggle("enlarged", enlarged);
      zoom.textContent = i18n.t(enlarged ? "plate.fit" : "plate.detail_zoom");
      zoom.setAttribute("aria-pressed", String(enlarged));
      pane.scrollTo(0, 0);
    }
    function show(trigger, source) {
      opener = trigger;
      const img = source.querySelector("img");
      image.src = img.currentSrc || img.src;
      image.alt = img.alt;
      download.href = image.src;
      setZoom(phoneFigure.matches);
      dialog.showModal();
      document.querySelector("#dialog-close").focus();
    }
    document.querySelectorAll(".plate-open, [data-dialog-image]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        show(link, link);
      });
    });
    document.querySelectorAll(".figure-zoom").forEach((button) => {
      button.addEventListener("click", () => show(button, button.closest("figure").querySelector(".plate-open")));
    });
    zoom.addEventListener("click", () => setZoom(!pane.classList.contains("enlarged")));
    document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => opener?.focus({ preventScroll: true }));
  }

  function closeSectionsMenu({ restoreFocus = false } = {}) {
    const header = document.querySelector("#site-header");
    const toggle = document.querySelector("#sections-toggle");
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    document.querySelector("#section-menu").hidden = true;
    if (restoreFocus) toggle.focus();
  }

  function setupSectionsMenu() {
    const header = document.querySelector("#site-header");
    const toggle = document.querySelector("#sections-toggle");
    const menu = document.querySelector("#section-menu");
    toggle.addEventListener("click", () => {
      const open = !header.classList.contains("nav-open");
      header.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      if (open) menu.querySelector("a")?.focus();
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeSectionsMenu()));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && header.classList.contains("nav-open")) {
        event.preventDefault();
        closeSectionsMenu({ restoreFocus: true });
      }
    });
  }

  function setupFocusInteractions() {
    const params = new URLSearchParams(window.location.search);
    focusMode = params.get("focus") === "1";
    const requestedStep = Number(params.get("step"));
    if (Number.isInteger(requestedStep)) focusStep = Math.max(1, Math.min(focusCount, requestedStep));
    renderFocus();

    focusToggle.addEventListener("click", toggleFocus);
    focusPrev.addEventListener("click", () => setFocusStep(focusStep - 1));
    focusNext.addEventListener("click", () => setFocusStep(focusStep + 1));
    document.addEventListener("keydown", (event) => {
      if (!focusMode || event.defaultPrevented || document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        toggleFocus();
        return;
      }
      if (document.activeElement?.closest("input, select, textarea, button, summary, .table-wrap")) return;
      if (event.key === "ArrowLeft") setFocusStep(focusStep - 1);
      if (event.key === "ArrowRight") setFocusStep(focusStep + 1);
      if (event.key === "Home") setFocusStep(1);
      if (event.key === "End") setFocusStep(focusCount);
    });

    let touchStart;
    focusStage.addEventListener("touchstart", (event) => {
      touchStart = null;
      if (!focusMode || event.target.closest(".table-wrap, button, select, summary")) return;
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    focusStage.addEventListener("touchend", (event) => {
      if (!touchStart || document.querySelector("dialog[open]")) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
      setFocusStep(focusStep + (dx < 0 ? 1 : -1));
    }, { passive: true });
    focusStage.addEventListener("touchcancel", () => { touchStart = null; });
  }

  function setupControls() {
    document.querySelector("#language-toggle").addEventListener("click", () => i18n.toggle());
    modelSelect.addEventListener("change", renderExplorer);
    datasetSelect.addEventListener("change", renderExplorer);
    unitToggle.addEventListener("click", () => {
      percentageMode = !percentageMode;
      renderExplorer();
    });
    journalExplorers.forEach((panel) => {
      panel.querySelector("select").addEventListener("change", () => renderJournal(panel));
    });
    phoneFigure.addEventListener("change", refreshFigures);
    document.querySelectorAll("[data-copy-citation]").forEach((button) => {
      button.addEventListener("click", async () => {
        const citation = button.closest(".citation-card").querySelector("pre");
        try {
          await navigator.clipboard.writeText(citation.innerText);
          button.textContent = i18n.t("controls.copied");
        } catch {
          const range = document.createRange();
          range.selectNodeContents(citation);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          button.textContent = i18n.t("controls.copy_failed");
        }
        window.setTimeout(() => { button.textContent = i18n.t("controls.copy"); }, 1600);
      });
    });
  }

  window.addEventListener("lsa-language-change", () => {
    focusLabel.textContent = focusName(focusStep);
    focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    refreshFigures();
    renderExplorer();
    journalExplorers.forEach(renderJournal);
  });

  async function initialize() {
    await i18n.initialise();
    setupControls();
    setupSectionsMenu();
    setupFocusInteractions();
    setupImageDialog();

    await Promise.all([loadEvidence(), loadJournal()]);
  }

  initialize().catch((error) => console.error("[LSA-Probe initialize]", error));
})();
