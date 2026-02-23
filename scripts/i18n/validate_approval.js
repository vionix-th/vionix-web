#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const locales = readJson("src/i18n/locales.json");
const approval = readJson("src/i18n/approval.json");

const pageKeys = fs
  .readdirSync(path.join(root, "src/pages"))
  .filter((f) => f.endsWith(".11tydata.json"))
  .map((f) => f.replace(/\.11tydata\.json$/, ""));

function validateApprovedEntry(locale, pageKey, entry) {
  if (!entry || entry.status !== "approved") {
    console.error(`[FAIL] ${locale}.${pageKey} must be approved`);
    return 1;
  }
  if (!entry.reviewer || !entry.approvedAt) {
    console.error(`[FAIL] ${locale}.${pageKey} approved entry requires reviewer and approvedAt`);
    return 1;
  }
  return 0;
}

let failures = 0;

for (const locale of locales.publishLocales || []) {
  for (const pageKey of pageKeys) {
    failures += validateApprovedEntry(locale, pageKey, approval[locale]?.[pageKey]);
  }
}

for (const locale of locales.stagedLocales || []) {
  const localeEntries = approval[locale] || {};

  for (const pageKey of pageKeys) {
    const entry = localeEntries[pageKey];
    if (!entry) {
      console.error(`[FAIL] ${locale}.${pageKey} missing approval status`);
      failures += 1;
      continue;
    }

    if (!["approved", "draft", "blocked"].includes(entry.status)) {
      console.error(`[FAIL] ${locale}.${pageKey} invalid status "${entry.status}"`);
      failures += 1;
    }

    if (entry.status === "approved") {
      failures += validateApprovedEntry(locale, pageKey, entry);
    }
  }

  const stagedRequiredApproved = (locales.stagedRequiredApproved || {})[locale] || [];
  if (stagedRequiredApproved.length > 0) {
    for (const pageKey of stagedRequiredApproved) {
      failures += validateApprovedEntry(locale, pageKey, localeEntries[pageKey]);
    }
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("[PASS] i18n approval manifest is valid.");
