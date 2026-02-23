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

  # Enhancement dependency contracts.
  if has_match 'data-aos=' "$html"; then
    has_match 'assets/vendor/aos/aos\.js' "$html" || fail "$(basename "$html") uses data-aos but is missing assets/vendor/aos/aos.js"
    has_match 'assets/vendor/aos/aos\.css' "$html" || fail "$(basename "$html") uses data-aos but is missing assets/vendor/aos/aos.css"
  fi

  if has_match 'isotope-layout|isotope-container|isotope-filters' "$html"; then
    has_match 'assets/vendor/imagesloaded/imagesloaded\.pkgd\.min\.js' "$html" || fail "$(basename "$html") uses isotope markup but is missing imagesLoaded"
    has_match 'assets/vendor/isotope-layout/isotope\.pkgd\.min\.js' "$html" || fail "$(basename "$html") uses isotope markup but is missing Isotope"
  fi

  if has_match 'init-swiper|class="swiper ' "$html"; then
    has_match 'assets/vendor/swiper/swiper-bundle\.min\.js' "$html" || fail "$(basename "$html") uses swiper markup but is missing Swiper JS"
    has_match 'assets/vendor/swiper/swiper-bundle\.min\.css' "$html" || fail "$(basename "$html") uses swiper markup but is missing Swiper CSS"
  fi

  if has_match 'class="[^"]*glightbox' "$html"; then
    has_match 'assets/vendor/glightbox/js/glightbox\.min\.js' "$html" || fail "$(basename "$html") uses glightbox but is missing GLightbox JS"
    has_match 'assets/vendor/glightbox/css/glightbox\.min\.css' "$html" || fail "$(basename "$html") uses glightbox but is missing GLightbox CSS"
  fi

  if has_match 'skills-animation' "$html"; then
    has_match 'assets/vendor/waypoints/noframework\.waypoints\.js' "$html" || fail "$(basename "$html") uses skills-animation but is missing Waypoints"
  fi

  if has_match 'purecounter' "$html"; then
    has_match 'assets/vendor/purecounter/purecounter_vanilla\.js' "$html" || fail "$(basename "$html") uses purecounter but is missing PureCounter"
  fi
done < <(find "$DIST" -type f -name "*.html" | sort)

echo "[PASS] Site contracts verified for $actual_pages pages."
