#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

const migratedPages = [
  "index",
  "service-details",
  "case-studies",
  "skilltable-team1",
  "skilltable-team2"
];

let failures = 0;

for (const page of migratedPages) {
  const tmplPath = path.join(root, "src/pages", `${page}.njk`);
  const dataPath = path.join(root, "src/pages", `${page}.11tydata.json`);

  const tmpl = fs.readFileSync(tmplPath, "utf8");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (/\{\%\s*if\s+localeCode/.test(tmpl) || /\{\%\s*else\s*\%\}/.test(tmpl)) {
    console.error(`[FAIL] ${page}.njk contains locale branching; use dictionary-driven content only.`);
    failures += 1;
  }

  if (!data.pageContentKey) {
    console.error(`[FAIL] ${page}.11tydata.json missing pageContentKey.`);
    failures += 1;
  }

  if (!data.pageApprovalKey) {
    console.error(`[FAIL] ${page}.11tydata.json missing pageApprovalKey.`);
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log("[PASS] template contracts verified for migrated i18n pages.");
