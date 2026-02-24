#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function collectLeafPaths(value, prefix = "") {
  const out = [];
  if (Array.isArray(value)) {
    value.forEach((v, i) => out.push(...collectLeafPaths(v, `${prefix}[${i}]`)));
    return out;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => {
      const next = prefix ? `${prefix}.${k}` : k;
      out.push(...collectLeafPaths(v, next));
    });
    return out;
  }
  out.push(prefix);
  return out;
}

function compareKeys(baseObj, candidateObj, label) {
  const base = new Set(collectLeafPaths(baseObj));
  const cand = new Set(collectLeafPaths(candidateObj));

  const missing = [...base].filter((k) => !cand.has(k));
  const extra = [...cand].filter((k) => !base.has(k));

  if (missing.length || extra.length) {
    console.error(`[FAIL] key mismatch in ${label}`);
    if (missing.length) {
      console.error(`  Missing keys (${missing.length}):`);
      missing.slice(0, 50).forEach((k) => console.error(`    - ${k}`));
    }
    if (extra.length) {
      console.error(`  Extra keys (${extra.length}):`);
      extra.slice(0, 50).forEach((k) => console.error(`    + ${k}`));
    }
    process.exitCode = 1;
  }
}

const locales = readJson("src/i18n/locales.json");
const supported = locales.supportedLocales || [];
const defaultLocale = locales.defaultLocale;

const schemaFiles = [
  "site.json",
  "nav.json",
  "footer.json",
  "page-meta.json",
  "home.json",
  "service-details.json",
  "case-studies.json",
  "skilltable-team1.json",
  "skilltable-team2.json"
];

for (const file of schemaFiles) {
  const base = readJson(`src/data/${defaultLocale}/${file}`);
  for (const locale of supported) {
    if (locale === defaultLocale) continue;
    const targetPath = `src/data/${locale}/${file}`;
    if (!fs.existsSync(path.join(root, targetPath))) {
      console.error(`[FAIL] missing locale file: ${targetPath}`);
      process.exitCode = 1;
      continue;
    }
    const candidate = readJson(targetPath);
    compareKeys(base, candidate, targetPath);
  }
}

function listCaseStudyFiles(locale) {
  const dir = path.join(root, `src/data/${locale}/case-study-details`);
  if (!fs.existsSync(dir)) return null;
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort();
}

for (const locale of supported) {
  const baseFiles = listCaseStudyFiles(defaultLocale);
  const candidateFiles = listCaseStudyFiles(locale);

  if (!baseFiles || !candidateFiles) {
    console.error(`[FAIL] missing case-study-details directory for locale ${locale}`);
    process.exitCode = 1;
    continue;
  }

  const missingFiles = baseFiles.filter((f) => !candidateFiles.includes(f));
  const extraFiles = candidateFiles.filter((f) => !baseFiles.includes(f));
  if (missingFiles.length || extraFiles.length) {
    console.error(`[FAIL] case-study-details file mismatch for locale ${locale}`);
    missingFiles.forEach((f) => console.error(`  - missing ${f}`));
    extraFiles.forEach((f) => console.error(`  + extra ${f}`));
    process.exitCode = 1;
    continue;
  }

  if (locale === defaultLocale) continue;
  for (const file of baseFiles) {
    const base = readJson(`src/data/${defaultLocale}/case-study-details/${file}`);
    const candidate = readJson(`src/data/${locale}/case-study-details/${file}`);
    compareKeys(base, candidate, `src/data/${locale}/case-study-details/${file}`);
  }
}

const pillars = readJson("src/data/taxonomy/service-pillars.json");
for (const [id, entry] of Object.entries(pillars)) {
  if (!entry.icon) {
    console.error(`[FAIL] taxonomy.${id} missing icon`);
    process.exitCode = 1;
  }
  for (const locale of supported) {
    if (!entry.labels || !entry.labels[locale]) {
      console.error(`[FAIL] taxonomy.${id}.labels missing locale ${locale}`);
      process.exitCode = 1;
    }
  }
}

if (process.exitCode) {
  process.exit(1);
}
console.log("[PASS] i18n key schemas are complete for all locales.");
