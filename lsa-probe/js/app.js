(() => {
  "use strict";

  const i18n = window.LSAI18n;
  const focusSections = [...document.querySelectorAll(".focus-section")];
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

  let focusMode = false;
  let focusStep = 1;
  let evidence = [];
  let percentageMode = false;
  let walkIndex = 0;
  let walkTimer = null;

  const walkthroughStates = [
    { interval: "[0, ηmax]", pgd: "δ̃(0)", check: "D ≥ τ ?", key: "walkthrough.ready" },
    { interval: "[0, ηmax]", pgd: "ηm ← (l+u)/2", check: "D ≥ τ ?", key: "walkthrough.state1" },
    { interval: "[0, ηmax]", pgd: "δ̃(0) → δ̃(K)", check: "D ≥ τ ?", key: "walkthrough.state2" },
    { interval: "[0, ηmax]", pgd: "δ̃(K)", check: "D(ηm) ≥ τ", key: "walkthrough.state3" },
    { interval: "[l, ηm] or [ηm, u]", pgd: "reset / restart", check: "update [l,u]", key: "walkthrough.state4" },
    { interval: "u−l → ε", pgd: "complete", check: "stop", key: "walkthrough.state5" }
  ];

  function focusName(step) {
    return i18n.t(`focus.step${step}`);
  }

  function updateUrlForFocus() {
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

  function pauseWalkthrough() {
    if (walkTimer) window.clearInterval(walkTimer);
    walkTimer = null;
  }

  function renderFocus({ moveFocus = false } = {}) {
    document.body.classList.toggle("focus-mode", focusMode);
    focusControls.hidden = !focusMode;
    focusSections.forEach((section) => {
      const active = Number(section.dataset.focusStep) === focusStep;
      section.classList.toggle("focus-active", active);
      section.setAttribute("aria-hidden", focusMode && !active ? "true" : "false");
    });
    focusCurrent.textContent = String(focusStep);
    focusLabel.textContent = focusName(focusStep);
    focusPrev.disabled = focusStep === 1;
    focusNext.disabled = focusStep === 8;
    focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    focusToggle.setAttribute("aria-pressed", String(focusMode));
    updateUrlForFocus();
    pauseWalkthrough();
    if (moveFocus && focusMode) {
      const activeHeading = document.querySelector(".focus-active h2");
      if (activeHeading) {
        activeHeading.setAttribute("tabindex", "-1");
        activeHeading.focus({ preventScroll: true });
      }
    }
  }

  function setFocusStep(nextStep, moveFocus = true) {
    focusStep = Math.max(1, Math.min(8, nextStep));
    renderFocus({ moveFocus });
  }

  function toggleFocus() {
    focusMode = !focusMode;
    renderFocus({ moveFocus: focusMode });
    if (!focusMode) document.querySelector("#overview").scrollIntoView({ block: "start" });
  }

  function formatProportion(value, signed = false) {
    const prefix = signed && value > 0 ? "+" : "";
    return percentageMode ? `${prefix}${Math.round(value * 100)}%` : `${prefix}${value.toFixed(2)}`;
  }

  function formatTprGain(value) {
    return percentageMode ? `+${Math.round(value * 100)} pp` : `+${value.toFixed(2)}`;
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
      low: formatProportion(baseline.ci[0]), high: formatProportion(baseline.ci[1]), auc: baseline.auc.toFixed(2), std: baseline.auc_std.toFixed(2)
    });
    document.querySelector("#lsa-detail").textContent = i18n.t("explorer.tpr_detail", {
      low: formatProportion(lsa.ci[0]), high: formatProportion(lsa.ci[1]), auc: lsa.auc.toFixed(2), std: lsa.auc_std.toFixed(2)
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

  function renderWalkthrough() {
    const state = walkthroughStates[walkIndex];
    document.querySelector("#walk-interval").textContent = state.interval;
    document.querySelector("#walk-pgd").textContent = state.pgd;
    document.querySelector("#walk-check").textContent = state.check;
    document.querySelector("#walk-status").textContent = i18n.t(state.key);
  }

  function advanceWalkthrough() {
    walkIndex = Math.min(walkIndex + 1, walkthroughStates.length - 1);
    renderWalkthrough();
    if (walkIndex === walkthroughStates.length - 1) pauseWalkthrough();
  }

  function playWalkthrough() {
    pauseWalkthrough();
    if (walkIndex === walkthroughStates.length - 1) walkIndex = 0;
    renderWalkthrough();
    walkTimer = window.setInterval(advanceWalkthrough, 1050);
  }

  function resetWalkthrough() {
    pauseWalkthrough();
    walkIndex = 0;
    renderWalkthrough();
  }

  function setupImageDialog() {
    const dialog = document.querySelector("#image-dialog");
    const dialogImage = document.querySelector("#dialog-image");
    document.querySelectorAll("[data-dialog-image]").forEach((button) => {
      button.addEventListener("click", () => {
        const source = button.querySelector("img");
        dialogImage.src = button.dataset.dialogImage;
        dialogImage.alt = source?.alt || "";
        dialog.showModal();
      });
    });
    document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  function setupFocusInteractions() {
    const params = new URLSearchParams(window.location.search);
    focusMode = params.get("focus") === "1";
    const requestedStep = Number(params.get("step"));
    if (Number.isInteger(requestedStep)) focusStep = Math.max(1, Math.min(8, requestedStep));
    renderFocus();

    focusToggle.addEventListener("click", toggleFocus);
    focusPrev.addEventListener("click", () => setFocusStep(focusStep - 1));
    focusNext.addEventListener("click", () => setFocusStep(focusStep + 1));
    document.addEventListener("keydown", (event) => {
      if (!focusMode) return;
      if (event.key === "Escape") {
        toggleFocus();
        return;
      }
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowLeft") setFocusStep(focusStep - 1);
      if (event.key === "ArrowRight") setFocusStep(focusStep + 1);
    });

    let touchStartX = null;
    document.addEventListener("touchstart", (event) => {
      if (focusMode) touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    document.addEventListener("touchend", (event) => {
      if (!focusMode || touchStartX === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) < 60) return;
      setFocusStep(focusStep + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }

  function setupControls() {
    document.querySelector("#language-toggle").addEventListener("click", () => i18n.toggle());
    modelSelect.addEventListener("change", renderExplorer);
    datasetSelect.addEventListener("change", renderExplorer);
    unitToggle.addEventListener("click", () => {
      percentageMode = !percentageMode;
      renderExplorer();
    });
    document.querySelector("#walk-play").addEventListener("click", playWalkthrough);
    document.querySelector("#walk-pause").addEventListener("click", pauseWalkthrough);
    document.querySelector("#walk-step").addEventListener("click", advanceWalkthrough);
    document.querySelector("#walk-reset").addEventListener("click", resetWalkthrough);
    document.querySelector("#copy-citation").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const text = document.querySelector("#citation").innerText;
      await navigator.clipboard.writeText(text);
      button.textContent = i18n.t("controls.copied");
      window.setTimeout(() => { button.textContent = i18n.t("controls.copy"); }, 1600);
    });
  }

  window.addEventListener("lsa-language-change", () => {
    if (focusLabel) focusLabel.textContent = focusName(focusStep);
    if (focusToggle) focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    renderWalkthrough();
    renderExplorer();
  });

  async function initialise() {
    await i18n.initialise();
    setupControls();
    setupFocusInteractions();
    setupImageDialog();
    renderWalkthrough();
    await loadEvidence();
  }

  initialise().catch((error) => console.error("[LSA-Probe initialise]", error));
})();
