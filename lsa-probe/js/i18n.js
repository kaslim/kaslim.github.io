(() => {
  const SUPPORTED = new Set(["en", "zh-CN"]);
  const FALLBACK = "en";
  const cache = new Map();
  let current = FALLBACK;
  let dictionary = {};

  function requestedLanguage() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl) return SUPPORTED.has(fromUrl) ? fromUrl : FALLBACK;
    const saved = window.localStorage.getItem("lsa-probe-language");
    return SUPPORTED.has(saved) ? saved : FALLBACK;
  }

  async function loadDictionary(language) {
    if (cache.has(language)) return cache.get(language);
    const response = await fetch(`locales/${language}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${language} translations (${response.status})`);
    const values = await response.json();
    cache.set(language, values);
    return values;
  }

  function interpolate(value, variables = {}) {
    return String(value).replace(/\{([^}]+)\}/g, (_, name) => variables[name] ?? `{${name}}`);
  }

  function t(key, variables = {}) {
    if (!(key in dictionary)) {
      console.error(`[LSA-Probe i18n] Missing key: ${key}`);
      return key;
    }
    return interpolate(dictionary[key], variables);
  }

  function apply() {
    document.documentElement.lang = current;
    document.title = t("meta.title");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
      node.setAttribute("alt", t(node.dataset.i18nAlt));
    });

    const languageToggle = document.querySelector("#language-toggle");
    if (languageToggle) languageToggle.textContent = current === "en" ? "中文" : "EN";
    window.dispatchEvent(new CustomEvent("lsa-language-change", { detail: { language: current } }));
  }

  async function setLanguage(language, { updateUrl = true } = {}) {
    current = SUPPORTED.has(language) ? language : FALLBACK;
    try {
      dictionary = await loadDictionary(current);
    } catch (error) {
      console.error("[LSA-Probe i18n]", error);
      current = FALLBACK;
      dictionary = await loadDictionary(FALLBACK);
    }
    window.localStorage.setItem("lsa-probe-language", current);
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

  window.LSAI18n = {
    initialise,
    setLanguage,
    toggle: () => setLanguage(current === "en" ? "zh-CN" : "en"),
    t,
    get language() { return current; }
  };
})();
