(() => {
  "use strict";

  const SUPPORTED = new Set(["en", "zh"]);
  const FALLBACK = "en";
  const cache = new Map();
  let current = FALLBACK;
  let dictionary = {};

  function requestedLanguage() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (!fromUrl) return FALLBACK;
    return SUPPORTED.has(fromUrl) ? fromUrl : FALLBACK;
  }

  async function loadDictionary(language) {
    if (cache.has(language)) return cache.get(language);
    const response = await fetch(`locales/${language}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${language} translations (${response.status})`);
    const values = await response.json();
    cache.set(language, values);
    return values;
  }

  function t(key) {
    if (!(key in dictionary)) {
      console.error(`[TS-RaMIA i18n] Missing key: ${key}`);
      return key;
    }
    return String(dictionary[key]);
  }

  function apply() {
    document.documentElement.lang = current === "zh" ? "zh-CN" : "en";
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", t("meta.title"));
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
      node.setAttribute("alt", t(node.dataset.i18nAlt));
    });

    const toggle = document.querySelector("#language-toggle");
    if (toggle) toggle.textContent = current === "en" ? "中文" : "EN";
    window.dispatchEvent(new CustomEvent("ts-language-change", { detail: { language: current } }));
  }

  async function setLanguage(language, { updateUrl = true } = {}) {
    current = SUPPORTED.has(language) ? language : FALLBACK;
    try {
      dictionary = await loadDictionary(current);
    } catch (error) {
      console.error("[TS-RaMIA i18n]", error);
      current = FALLBACK;
      dictionary = await loadDictionary(FALLBACK);
    }
    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", current);
      window.history.replaceState({}, "", url);
    }
    apply();
  }

  async function initialise() {
    await setLanguage(requestedLanguage(), { updateUrl: false });
  }

  window.TSRamiaI18n = {
    initialise,
    setLanguage,
    toggle: () => setLanguage(current === "en" ? "zh" : "en"),
    t,
    get language() { return current; }
  };
})();
