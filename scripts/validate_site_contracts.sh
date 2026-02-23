#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
SRC_PAGES="$ROOT/src/pages"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

has_rg() {
  command -v rg >/dev/null 2>&1
}

has_match() {
  local pattern="$1"
  local file="$2"
  if has_rg; then
    rg -q "$pattern" "$file"
  else
    grep -Eq "$pattern" "$file"
  fi
}

first_line() {
  local pattern="$1"
  local file="$2"
  if has_rg; then
    rg -n "$pattern" "$file" | head -n1 | cut -d: -f1 || true
  else
    awk -v pat="$pattern" 'match($0, pat) { print NR; exit }' "$file"
  fi
}

# No hand-maintained root HTML sources should remain.
if find "$ROOT" -maxdepth 1 -type f -name "*.html" | grep -q .; then
  fail "Legacy root-level HTML files detected. Source pages must live in src/pages only."
fi

[[ -d "$DIST" ]] || fail "dist directory missing. Run npm run build first."

expected_pages=$(node -e '
const fs=require("fs");
const path=require("path");
const root=process.cwd();
const i18n=require(path.join(root,"src/i18n/locales.json"));
const approval=require(path.join(root,"src/i18n/approval.json"));
const pageCount=fs.readdirSync(path.join(root,"src/pages")).filter(f=>f.endsWith(".njk")).length;
const publishCount=(i18n.publishLocales||[]).length*pageCount;
const stagedApproved=(i18n.stagedLocales||[]).reduce((acc,locale)=>{
  const entries=approval[locale]||{};
  return acc+Object.values(entries).filter(e=>e&&e.status==="approved").length;
},0);
console.log(pageCount + publishCount + stagedApproved);
' | tr -d " ")
actual_pages=$(find "$DIST" -type f -name "*.html" | wc -l | tr -d " ")
[[ "$actual_pages" = "$expected_pages" ]] || fail "dist HTML count mismatch (expected $expected_pages, got $actual_pages)."

for required in CNAME robots.txt sitemap.xml; do
  [[ -f "$DIST/$required" ]] || fail "dist/$required missing"
done

while IFS= read -r html; do
  nav_line=$(first_line "assets/js/nav.js" "$html")
  main_line=$(first_line "assets/js/main.js" "$html")
  main_css_line=$(first_line "assets/css/main.css" "$html")

  [[ -n "$nav_line" ]] || fail "$(basename "$html") missing assets/js/nav.js include"
  [[ -n "$main_line" ]] || fail "$(basename "$html") missing assets/js/main.js include"
  [[ -n "$main_css_line" ]] || fail "$(basename "$html") missing assets/css/main.css include"
  [[ "$nav_line" -lt "$main_line" ]] || fail "$(basename "$html") must load nav.js before main.js"

  if has_match '<link href="[^/"][^"]?" rel="stylesheet">' "$html"; then
    fail "$(basename "$html") contains malformed stylesheet href values"
  fi
done < <(find "$DIST" -type f -name "*.html" | sort)

echo "[PASS] Site contracts verified for $actual_pages pages."
