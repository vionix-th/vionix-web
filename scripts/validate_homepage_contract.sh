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

[[ -f "$HTML" ]] || fail "dist/index.html missing (run npm run build)"
[[ -f "$CSS_MAIN" ]] || fail "dist/assets/css/main.css missing"
[[ -f "$CSS_COMPONENTS" ]] || fail "dist/assets/css/components.css missing"
[[ -f "$CSS_HOME" ]] || fail "dist/assets/css/homepage.css missing"
[[ -f "$JS_NAV" ]] || fail "dist/assets/js/nav.js missing"
[[ -f "$JS_MAIN" ]] || fail "dist/assets/js/main.js missing"

has_match "assets/css/main.css" "$HTML" || fail "dist/index.html must include main.css"
has_match "assets/css/components.css" "$HTML" || fail "dist/index.html must include components.css"
has_match "assets/css/homepage.css" "$HTML" || fail "dist/index.html must include homepage.css"
has_match "assets/js/nav.js" "$HTML" || fail "dist/index.html must include nav.js"
has_match "assets/js/main.js" "$HTML" || fail "dist/index.html must include main.js"
has_match "id=\"navmenu\"" "$HTML" || fail "dist/index.html must include navmenu markup"

nav_line=$(first_line "assets/js/nav.js" "$HTML")
main_line=$(first_line "assets/js/main.js" "$HTML")
[[ "${nav_line:-0}" -lt "${main_line:-0}" ]] || fail "dist/index.html must load nav.js before main.js"

main_css_line=$(first_line "assets/css/main.css" "$HTML")
components_css_line=$(first_line "assets/css/components.css" "$HTML")
[[ "${main_css_line:-0}" -lt "${components_css_line:-0}" ]] || fail "dist/index.html must load components.css after main.css"

echo "[PASS] Homepage contract verified."
