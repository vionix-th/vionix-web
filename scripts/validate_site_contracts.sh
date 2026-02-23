#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
SRC_PAGES="$ROOT/src/pages"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

# No hand-maintained root HTML sources should remain.
if find "$ROOT" -maxdepth 1 -type f -name "*.html" | grep -q .; then
  fail "Legacy root-level HTML files detected. Source pages must live in src/pages only."
fi

[[ -d "$DIST" ]] || fail "dist directory missing. Run npm run build first."

expected_pages=$(find "$SRC_PAGES" -maxdepth 1 -type f -name "*.njk" | wc -l | tr -d " ")
actual_pages=$(find "$DIST" -maxdepth 1 -type f -name "*.html" | wc -l | tr -d " ")
[[ "$actual_pages" = "$expected_pages" ]] || fail "dist HTML count mismatch (expected $expected_pages, got $actual_pages)."

for required in CNAME robots.txt sitemap.xml; do
  [[ -f "$DIST/$required" ]] || fail "dist/$required missing"
done

for html in "$DIST"/*.html; do
  nav_line=$(rg -n "assets/js/nav.js" "$html" | head -n1 | cut -d: -f1 || true)
  main_line=$(rg -n "assets/js/main.js" "$html" | head -n1 | cut -d: -f1 || true)
  main_css_line=$(rg -n "assets/css/main.css" "$html" | head -n1 | cut -d: -f1 || true)

  [[ -n "$nav_line" ]] || fail "$(basename "$html") missing assets/js/nav.js include"
  [[ -n "$main_line" ]] || fail "$(basename "$html") missing assets/js/main.js include"
  [[ -n "$main_css_line" ]] || fail "$(basename "$html") missing assets/css/main.css include"
  [[ "$nav_line" -lt "$main_line" ]] || fail "$(basename "$html") must load nav.js before main.js"

  if rg -q '<link href="[^/"][^"]?" rel="stylesheet">' "$html"; then
    fail "$(basename "$html") contains malformed stylesheet href values"
  fi
done

echo "[PASS] Site contracts verified for $actual_pages pages."
