#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const locales = readJson("src/i18n/locales.json");
const targets = [
  "nav.json",
  "footer.json",
  "page-meta.json",
  "home.json",
  "service-details.json",
  "case-studies.json",
  "skilltable-team1.json",
  "skilltable-team2.json"
];

const issues = [];

function walk(value, keyPath, filePath) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${keyPath}[${i}]`, filePath));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => walk(v, keyPath ? `${keyPath}.${k}` : k, filePath));
    return;
  }
  if (typeof value !== "string") return;

  const s = value;
  const add = (msg) => issues.push(`${filePath}:${keyPath} -> ${msg}`);

  if (/(^|\.)(href|email|github|siteUrl)$/i.test(keyPath)) return;
  if (/^https?:\/\//i.test(s) || s.includes("@")) return;
  const hasTechNotation = /Node\.js|C#|C\+\+|\.NET|VB6|IMAP4|APQP|FMEA|MSA|SPC|PPAP|IATF|VDA|ETL|BI|SQL|FTP|API|\/|\\/.test(
    s
  );

  if (!hasTechNotation && /\p{L}[.:!?]\p{L}/u.test(s)) {
    add("missing whitespace after punctuation");
  }
  if (/\p{L}\s+[,:;.!?]/u.test(s)) {
    add("unexpected whitespace before punctuation");
  }
  if (/(TODO|MISSING|lorem ipsum|XXX)/i.test(s)) {
    add("placeholder-like content detected");
  }
  if (/\s{2,}/.test(s)) {
    add("double whitespace detected");
  }
}

for (const locale of locales.supportedLocales || []) {
  for (const file of targets) {
    const rel = `src/data/${locale}/${file}`;
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    const json = readJson(rel);
    walk(json, "", rel);
  }
}

if (issues.length) {
  console.error("[FAIL] i18n typography checks failed:");
  issues.slice(0, 200).forEach((i) => console.error(`  - ${i}`));
  process.exit(1);
}

console.log("[PASS] i18n typography checks passed.");
