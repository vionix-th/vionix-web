#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"
HTML="$DIST/index.html"
CSS_MAIN="$DIST/assets/css/main.css"
CSS_COMPONENTS="$DIST/assets/css/components.css"
CSS_HOME="$DIST/assets/css/homepage.css"
JS_NAV="$DIST/assets/js/nav.js"
JS_MAIN="$DIST/assets/js/main.js"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

[[ -f "$HTML" ]] || fail "dist/index.html missing (run npm run build)"
[[ -f "$CSS_MAIN" ]] || fail "dist/assets/css/main.css missing"
[[ -f "$CSS_COMPONENTS" ]] || fail "dist/assets/css/components.css missing"
[[ -f "$CSS_HOME" ]] || fail "dist/assets/css/homepage.css missing"
[[ -f "$JS_NAV" ]] || fail "dist/assets/js/nav.js missing"
[[ -f "$JS_MAIN" ]] || fail "dist/assets/js/main.js missing"

rg -q "assets/css/main.css" "$HTML" || fail "dist/index.html must include main.css"
rg -q "assets/css/components.css" "$HTML" || fail "dist/index.html must include components.css"
rg -q "assets/css/homepage.css" "$HTML" || fail "dist/index.html must include homepage.css"
rg -q "assets/js/nav.js" "$HTML" || fail "dist/index.html must include nav.js"
rg -q "assets/js/main.js" "$HTML" || fail "dist/index.html must include main.js"
rg -q "id=\"navmenu\"" "$HTML" || fail "dist/index.html must include navmenu markup"

nav_line=$(rg -n "assets/js/nav.js" "$HTML" | head -n1 | cut -d: -f1)
main_line=$(rg -n "assets/js/main.js" "$HTML" | head -n1 | cut -d: -f1)
[[ "${nav_line:-0}" -lt "${main_line:-0}" ]] || fail "dist/index.html must load nav.js before main.js"

main_css_line=$(rg -n "assets/css/main.css" "$HTML" | head -n1 | cut -d: -f1)
components_css_line=$(rg -n "assets/css/components.css" "$HTML" | head -n1 | cut -d: -f1)
[[ "${main_css_line:-0}" -lt "${components_css_line:-0}" ]] || fail "dist/index.html must load components.css after main.css"

echo "[PASS] Homepage contract verified."
