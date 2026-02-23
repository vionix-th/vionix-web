const pageDefaults = require("../data/en/page-defaults.json");
const i18n = require("../i18n/locales.json");
const enSite = require("../data/en/site.json");
const enNav = require("../data/en/nav.json");
const enFooter = require("../data/en/footer.json");
const deSite = require("../data/de/site.json");
const deNav = require("../data/de/nav.json");
const deFooter = require("../data/de/footer.json");

const localeBundles = {
  en: { site: enSite, nav: enNav, footer: enFooter },
  de: { site: deSite, nav: deNav, footer: deFooter }
};

const defaultLocale = i18n.defaultLocale;

function localizeHref(href, localeCode) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (href.startsWith("/")) return href;
  if (href.startsWith("assets/")) return href;

  const [path, fragment] = href.split("#");
  const cleanPath = path.replace(/^\/+/, "");

  if (localeCode === defaultLocale) {
    const localized = `/${cleanPath}`;
    return fragment ? `${localized}#${fragment}` : localized;
  }

  const localized = `/${localeCode}/${cleanPath}`;
  return fragment ? `${localized}#${fragment}` : localized;
}

module.exports = {
  ...pageDefaults,
  supportedLocales: i18n.supportedLocales,
  pagination: {
    data: "supportedLocales",
    size: 1,
    alias: "localeCode"
  },
  eleventyComputed: {
    htmlLang: (data) => data.localeCode,
    localeData: (data) => localeBundles[data.localeCode] || localeBundles[defaultLocale],
    permalink: (data) => {
      const base = data.permalink || `/${data.page.fileSlug}.html`;
      if (data.localeCode === defaultLocale) {
        return base;
      }
      return `/${data.localeCode}${base}`;
    },
    canonicalUrl: (data) => {
      const siteUrl = (localeBundles[defaultLocale].site.siteUrl || "").replace(/\/$/, "");
      const base = data.permalink || `/${data.page.fileSlug}.html`;
      const localizedPath = data.localeCode === defaultLocale ? base : `/${data.localeCode}${base}`;
      return `${siteUrl}${localizedPath}`;
    },
    localeHref: (data) => (href) => localizeHref(href, data.localeCode)
  }
};
