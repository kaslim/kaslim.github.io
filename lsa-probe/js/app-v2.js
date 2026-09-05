(() => {
  "use strict";

  const i18n = window.LSAI18n;
  const focusStage = document.querySelector("#focus-stage");
  const focusSlides = [...document.querySelectorAll("[data-focus-slide]")];
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

  const walkthroughTargets = [
    { interval: "#walk-interval", pgd: "#walk-pgd", check: "#walk-check", status: "#walk-status" },
    { interval: "#focus-walk-interval", pgd: "#focus-walk-pgd", check: "#focus-walk-check", status: "#focus-walk-status" }
  ];

  const ordinaryAnchorForStep = {
    1: "#audit-question",
    2: "#diffusion-primer",
    3: "#threat-model",
    4: "#endpoint-loss",
    5: "#core-insight",
    6: "#method",
    7: "#evidence",
    8: "#reliability",
    9: "#agent-safety"
  };

  function inferFocusStep() {
    const sections = [...document.querySelectorAll(".focus-section[data-focus-step]")];
    const marker = window.scrollY + Math.min(window.innerHeight * 0.38, 280);
    let inferred = 1;
    sections.forEach((section) => {
      if (section.offsetTop <= marker) inferred = Number(section.dataset.focusStep) || inferred;
    });
    return inferred;
  }

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
    focusStage.hidden = !focusMode;

    focusSlides.forEach((slide) => {
      const active = Number(slide.dataset.focusSlide) === focusStep;
      slide.classList.toggle("is-active", active);
      slide.hidden = !active;
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if (active) slide.scrollTop = 0;
    });

    focusCurrent.textContent = String(focusStep);
    focusLabel.textContent = focusName(focusStep);
    focusPrev.disabled = focusStep === 1;
    focusNext.disabled = focusStep === focusCount;
    focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    focusToggle.setAttribute("aria-pressed", String(focusMode));
    updateUrlForFocus();
    pauseWalkthrough();

    if (moveFocus && focusMode) {
      const heading = document.querySelector(`.focus-slide[data-focus-slide="${focusStep}"] h2`);
      window.requestAnimationFrame(() => heading?.focus({ preventScroll: true }));
    }
  }

  function setFocusStep(nextStep, moveFocus = true) {
    focusStep = Math.max(1, Math.min(focusCount, nextStep));
    renderFocus({ moveFocus });
  }

  function toggleFocus() {
    const leavingStep = focusStep;
    if (!focusMode) focusStep = inferFocusStep();
    focusMode = !focusMode;
    renderFocus({ moveFocus: focusMode });
    if (!focusMode) {
      window.requestAnimationFrame(() => document.querySelector(ordinaryAnchorForStep[leavingStep])?.scrollIntoView({ block: "start" }));
    }
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
    walkthroughTargets.forEach((target) => {
      const interval = document.querySelector(target.interval);
      const pgd = document.querySelector(target.pgd);
      const check = document.querySelector(target.check);
      const status = document.querySelector(target.status);
      if (interval) interval.textContent = state.interval;
      if (pgd) pgd.textContent = state.pgd;
      if (check) check.textContent = state.check;
      if (status) status.textContent = i18n.t(state.key);
    });
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      advanceWalkthrough();
      return;
    }
    walkTimer = window.setInterval(advanceWalkthrough, 1050);
  }

  function resetWalkthrough() {
    pauseWalkthrough();
    walkIndex = 0;
    renderWalkthrough();
  }

  function translateSvgDocument(svgDocument) {
    if (!svgDocument) return;
    svgDocument.documentElement.setAttribute("lang", i18n.language);
    svgDocument.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = i18n.t(node.dataset.i18n);
    });
  }

  function translateEmbeddedSvgs() {
    document.querySelectorAll("object.translatable-svg, object.dialog-vector").forEach((object) => {
      try {
        translateSvgDocument(object.contentDocument);
      } catch (error) {
        console.error("[LSA-Probe SVG i18n]", error);
      }
    });
  }

  function setupEmbeddedSvgs() {
    document.querySelectorAll("object.translatable-svg").forEach((object) => {
      object.addEventListener("load", () => translateSvgDocument(object.contentDocument));
      if (object.contentDocument) translateSvgDocument(object.contentDocument);
    });
  }

  function setupImageDialog() {
    const dialog = document.querySelector("#image-dialog");
    const dialogImage = document.querySelector("#dialog-image");
    const dialogVector = document.querySelector("#dialog-vector");
    let returnFocus = null;

    document.querySelectorAll("[data-dialog-image]").forEach((button) => {
      button.addEventListener("click", () => {
        const source = button.querySelector("img");
        returnFocus = button;
        dialogVector.hidden = true;
        dialogImage.hidden = false;
        dialogImage.src = button.dataset.dialogImage;
        dialogImage.alt = source?.alt || "";
        dialog.showModal();
      });
    });
    document.querySelectorAll("[data-dialog-svg]").forEach((button) => {
      button.addEventListener("click", () => {
        returnFocus = button;
        dialogImage.hidden = true;
        dialogVector.hidden = false;
        dialogVector.data = button.dataset.dialogSvg;
        dialogVector.onload = () => translateSvgDocument(dialogVector.contentDocument);
        dialog.showModal();
      });
    });
    document.querySelector("#dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      returnFocus?.focus();
      returnFocus = null;
    });
  }

  function setupWalkthroughDialog() {
    const dialog = document.querySelector("#focus-walkthrough-dialog");
    const openButton = document.querySelector("#focus-walkthrough-open");
    const closeButton = document.querySelector("#focus-walkthrough-close");
    openButton.addEventListener("click", () => dialog.showModal());
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) {
        event.preventDefault();
        dialog.close();
      }
    });
    dialog.addEventListener("close", () => {
      pauseWalkthrough();
      openButton.focus();
    });
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
      if (!focusMode || document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        toggleFocus();
        return;
      }
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowLeft") setFocusStep(focusStep - 1);
      if (event.key === "ArrowRight") setFocusStep(focusStep + 1);
      if (event.key === "Home") setFocusStep(1);
      if (event.key === "End") setFocusStep(focusCount);
    });

    let touchStartX = null;
    document.addEventListener("touchstart", (event) => {
      if (focusMode && !document.querySelector("dialog[open]")) touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });
    document.addEventListener("touchend", (event) => {
      if (!focusMode || touchStartX === null || document.querySelector("dialog[open]")) return;
      const distance = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) < 60) return;
      setFocusStep(focusStep + (distance < 0 ? 1 : -1));
    }, { passive: true });
  }

  function bindWalkthroughControls(prefix = "walk") {
    document.querySelector(`#${prefix}-play`)?.addEventListener("click", playWalkthrough);
    document.querySelector(`#${prefix}-pause`)?.addEventListener("click", pauseWalkthrough);
    document.querySelector(`#${prefix}-step`)?.addEventListener("click", advanceWalkthrough);
    document.querySelector(`#${prefix}-reset`)?.addEventListener("click", resetWalkthrough);
  }

  function setupControls() {
    document.querySelector("#language-toggle").addEventListener("click", () => i18n.toggle());
    modelSelect.addEventListener("change", renderExplorer);
    datasetSelect.addEventListener("change", renderExplorer);
    unitToggle.addEventListener("click", () => {
      percentageMode = !percentageMode;
      renderExplorer();
    });
    bindWalkthroughControls("walk");
    bindWalkthroughControls("focus-walk");
    document.querySelector("#copy-citation").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const text = document.querySelector("#citation").innerText;
      await navigator.clipboard.writeText(text);
      button.textContent = i18n.t("controls.copied");
      window.setTimeout(() => { button.textContent = i18n.t("controls.copy"); }, 1600);
    });
  }

  window.addEventListener("lsa-language-change", () => {
    focusLabel.textContent = focusName(focusStep);
    focusToggle.textContent = i18n.t(focusMode ? "controls.exit_focus" : "controls.focus");
    renderWalkthrough();
    renderExplorer();
    translateEmbeddedSvgs();
  });

  async function initialize() {
    await i18n.initialise();
    setupControls();
    setupSectionsMenu();
    setupFocusInteractions();
    setupEmbeddedSvgs();
    setupImageDialog();
    setupWalkthroughDialog();
    renderWalkthrough();
    await loadEvidence();
  }

  initialize().catch((error) => console.error("[LSA-Probe initialize]", error));
})();
