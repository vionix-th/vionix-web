const pageDefaults = require("../data/en/page-defaults.json");
const i18n = require("../i18n/locales.json");
const approval = require("../i18n/approval.json");
const servicePillars = require("../data/taxonomy/service-pillars.json");

const enSite = require("../data/en/site.json");
const enNav = require("../data/en/nav.json");
const enFooter = require("../data/en/footer.json");
const enHome = require("../data/en/home.json");
const enServiceDetails = require("../data/en/service-details.json");
const enCaseStudies = require("../data/en/case-studies.json");
const enSkillTeam1 = require("../data/en/skilltable-team1.json");
const enSkillTeam2 = require("../data/en/skilltable-team2.json");

const deSite = require("../data/de/site.json");
const deNav = require("../data/de/nav.json");
const deFooter = require("../data/de/footer.json");
const deHome = require("../data/de/home.json");
const deServiceDetails = require("../data/de/service-details.json");
const deCaseStudies = require("../data/de/case-studies.json");
const deSkillTeam1 = require("../data/de/skilltable-team1.json");
const deSkillTeam2 = require("../data/de/skilltable-team2.json");

const thSite = require("../data/th/site.json");
const thNav = require("../data/th/nav.json");
const thFooter = require("../data/th/footer.json");
const thHome = require("../data/th/home.json");
const thServiceDetails = require("../data/th/service-details.json");
const thCaseStudies = require("../data/th/case-studies.json");
const thSkillTeam1 = require("../data/th/skilltable-team1.json");
const thSkillTeam2 = require("../data/th/skilltable-team2.json");

const localeBundles = {
  en: {
    site: enSite,
    nav: enNav,
    footer: enFooter,
    pages: {
      home: enHome,
      "service-details": enServiceDetails,
      "case-studies": enCaseStudies,
      "skilltable-team1": enSkillTeam1,
      "skilltable-team2": enSkillTeam2
    }
  },
  de: {
    site: deSite,
    nav: deNav,
    footer: deFooter,
    pages: {
      home: deHome,
      "service-details": deServiceDetails,
      "case-studies": deCaseStudies,
      "skilltable-team1": deSkillTeam1,
      "skilltable-team2": deSkillTeam2
    }
  },
  th: {
    site: thSite,
    nav: thNav,
    footer: thFooter,
    pages: {
      home: thHome,
      "service-details": thServiceDetails,
      "case-studies": thCaseStudies,
      "skilltable-team1": thSkillTeam1,
      "skilltable-team2": thSkillTeam2
    }
  }
};

const defaultLocale = i18n.defaultLocale;
const publishLocales = new Set(i18n.publishLocales || []);
const stagedLocales = new Set(i18n.stagedLocales || []);

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

function getLocalizedPillars(localeCode) {
  const out = {};
  for (const [id, item] of Object.entries(servicePillars)) {
    out[id] = {
      id,
      icon: item.icon,
      label: item.labels[localeCode] || item.labels[defaultLocale] || id
    };
  }
  return out;
}

function shouldRenderLocalePage(localeCode, pageKey) {
  if (localeCode === defaultLocale) return true;

  const entry = approval[localeCode]?.[pageKey];
  if (!entry || entry.status !== "approved") return false;

  if (publishLocales.has(localeCode)) return true;
  if (stagedLocales.has(localeCode)) return true;
  return false;
}

module.exports = {
  ...pageDefaults,
  supportedLocales: i18n.supportedLocales,
  pagination: {
    data: "supportedLocales",
    size: 1,
    alias: "localeCode",
    before: (allLocales, data) => {
      const pageKey = data.pageApprovalKey || data.currentPage || data.page?.fileSlug;
      return allLocales.filter((localeCode) => shouldRenderLocalePage(localeCode, pageKey));
    }
  },
  eleventyComputed: {
    htmlLang: (data) => data.localeCode,
    localeData: (data) => {
      const bundle = localeBundles[data.localeCode] || localeBundles[defaultLocale];
      return {
        site: bundle.site,
        nav: bundle.nav,
        footer: bundle.footer,
        taxonomy: getLocalizedPillars(data.localeCode)
      };
    },
    t: (data) => {
      const pageContentKey = data.pageContentKey;
      if (!pageContentKey) return {};
      const bundle = localeBundles[data.localeCode] || localeBundles[defaultLocale];
      return bundle.pages[pageContentKey] || {};
    },
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
