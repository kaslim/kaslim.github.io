(function () {
    const supported = ['en', 'zh-CN'];
    const params = new URLSearchParams(window.location.search);
    const queryLanguage = params.get('lang');
    let currentLanguage;
    if (queryLanguage !== null) {
        currentLanguage = supported.includes(queryLanguage) ? queryLanguage : 'en';
    } else {
        currentLanguage = 'en';
    }
    let messages = {};

    function getValue(key) {
        return key.split('.').reduce((value, part) => value && value[part], messages);
    }

    function format(key, values = {}) {
        const raw = getValue(key);
        if (typeof raw !== 'string') return key;
        return raw.replace(/\{(\w+)\}/g, (_, name) => values[name] === undefined ? `{${name}}` : String(values[name]));
    }

    function translateAttributes(element) {
        const declaration = element.dataset.i18nAttr;
        if (!declaration) return;
        declaration.split(';').forEach((mapping) => {
            const [attribute, key] = mapping.split(':').map((part) => part.trim());
            if (!attribute || !key) return;
            const value = getValue(key);
            if (typeof value === 'string') element.setAttribute(attribute, value);
        });
    }

    function applyDocumentTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const value = getValue(element.dataset.i18n);
            if (typeof value === 'string') element.textContent = value;
        });
        document.querySelectorAll('[data-i18n-attr]').forEach(translateAttributes);
        document.documentElement.lang = currentLanguage;
        document.title = getValue('meta.title') || document.title;
        const description = document.querySelector('meta[name="description"]');
        if (description && getValue('meta.description')) description.content = getValue('meta.description');

        const languageButton = document.getElementById('language-toggle');
        if (languageButton) {
            const isEnglish = currentLanguage === 'en';
            languageButton.textContent = format(isEnglish ? 'language.switchToZh' : 'language.switchToEn');
            languageButton.setAttribute('aria-label', format(isEnglish ? 'language.switchAriaZh' : 'language.switchAriaEn'));
        }
    }

    async function applyLanguage(language, options = {}) {
        currentLanguage = supported.includes(language) ? language : 'en';
        const response = await fetch(`locales/${currentLanguage}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Locale request failed: ${response.status}`);
        messages = await response.json();
        applyDocumentTranslations();
        try { localStorage.setItem('maia-language', currentLanguage); } catch (_) { /* Storage can be unavailable. */ }
        if (options.updateUrl) {
            const url = new URL(window.location.href);
            url.searchParams.set('lang', currentLanguage);
            history.replaceState({}, '', url);
        }
        window.dispatchEvent(new CustomEvent('maia:languagechange', { detail: { language: currentLanguage } }));
    }

    window.MAIAI18n = {
        ready: applyLanguage(currentLanguage),
        applyLanguage,
        t: format,
        get language() { return currentLanguage; }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const button = document.getElementById('language-toggle');
        if (!button) return;
        button.addEventListener('click', () => {
            const next = currentLanguage === 'en' ? 'zh-CN' : 'en';
            applyLanguage(next, { updateUrl: true }).catch((error) => console.error(error));
        });
    });
})();
