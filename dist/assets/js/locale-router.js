(function() {
  "use strict";

  const STORAGE_KEY = "vionix_locale_pref";
  const DEFAULT_LOCALE = "en";
  const SUPPORTED_LOCALES = ["en", "de", "th"];
  const AUTO_REDIRECT_LOCALES = ["de"];

  function getCurrentLocale(pathname) {
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === DEFAULT_LOCALE) continue;
      if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
        return locale;
      }
    }
    return DEFAULT_LOCALE;
  }

  function getStoredLocale() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      if (value && SUPPORTED_LOCALES.includes(value)) return value;
    } catch (error) {
      return null;
    }
    return null;
  }

  function setStoredLocale(locale) {
    if (!SUPPORTED_LOCALES.includes(locale)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function detectPreferredLocale() {
    const candidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || ""];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const normalized = String(candidate).toLowerCase();
      if (normalized.startsWith("de")) return "de";
      if (normalized.startsWith("th")) return "th";
      if (normalized.startsWith("en")) return "en";
    }
    return DEFAULT_LOCALE;
  }

  function maybeAutoRedirect() {
    const currentLocale = getCurrentLocale(window.location.pathname);
    const storedLocale = getStoredLocale();

    if (!storedLocale && currentLocale !== DEFAULT_LOCALE) {
      setStoredLocale(currentLocale);
      return;
    }

    if (storedLocale) return;

    const pathname = window.location.pathname;
    const isRootEntry = pathname === "/" || pathname === "/index.html";
    if (!isRootEntry) return;

    const preferredLocale = detectPreferredLocale();
    if (!AUTO_REDIRECT_LOCALES.includes(preferredLocale)) return;

    setStoredLocale(preferredLocale);
    const target = `/${preferredLocale}/index.html`;
    const query = window.location.search || "";
    const hash = window.location.hash || "";
    window.location.replace(`${target}${query}${hash}`);
  }

  function bindManualSwitcher() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-locale-switch]");
      if (!link) return;
      const locale = link.getAttribute("data-locale-switch");
      if (!locale) return;
      setStoredLocale(locale);
    });
  }

  maybeAutoRedirect();
  bindManualSwitcher();
})();
