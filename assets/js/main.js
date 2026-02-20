/**
* Template Name: BizLand
* Template URL: https://bootstrapmade.com/bizland-bootstrap-business-template/
* Updated: Dec 05 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS === 'undefined') return false;

    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    AOS.refresh();
    return true;
  }
  window.addEventListener('load', () => {
    if (!aosInit()) {
      // If vendor scripts load late, retry once after initial load.
      setTimeout(aosInit, 150);
    }
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash || navmenulink.hash === '#') return;

      let section;
      try {
        section = document.querySelector(navmenulink.hash);
      } catch (error) {
        return;
      }

      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * UseBasin contact form handler
   */
  document.querySelectorAll('form[data-basin-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const loading = form.querySelector('.loading');
      const error = form.querySelector('.error-message');
      const success = form.querySelector('.sent-message');

      if (loading) loading.classList.add('d-block');
      if (error) {
        error.classList.remove('d-block');
        error.textContent = '';
      }
      if (success) success.classList.remove('d-block');

      try {
        const response = await fetch(form.action, {
          method: form.method || 'POST',
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          let message = 'Submission failed. Please try again later.';
          try {
            const data = await response.json();
            if (data && data.error) {
              message = data.error;
            }
          } catch (parseError) {
            /* ignore parse errors */
          }
          throw new Error(message);
        }

        if (success) success.classList.add('d-block');
        form.reset();
      } catch (submissionError) {
        if (error) {
          let message = 'Submission failed. Please try again later.';
          if (submissionError instanceof Error && submissionError.message) {
            message = submissionError.message;
          } else if (typeof submissionError === 'string' && submissionError.trim()) {
            message = submissionError.trim();
          }
          error.textContent = message;
          error.classList.add('d-block');
        }
      } finally {
        if (loading) loading.classList.remove('d-block');
      }
    });
  });

  /**
   * Cookie preferences with category-level controls
   */
  const COOKIE_PREFERENCES_KEY = 'vionix_cookie_preferences_v2';
  const LEGACY_COOKIE_CONSENT_KEY = 'vionix_cookie_consent_v1';
  const LEGACY_COOKIE_CONSENT_ACCEPTED = 'accepted';
  const LEGACY_COOKIE_CONSENT_DECLINED = 'declined';
  const GA_MEASUREMENT_ID = 'G-THRH69PMFC';
  const GA_SCRIPT_ID = 'vionix-ga4-script';
  const DEFAULT_COOKIE_PREFERENCES = {
    required: true,
    optional_features: false,
    analytics: false
  };

  function sanitizeCookiePreferences(raw) {
    return {
      required: true,
      optional_features: Boolean(raw && raw.optional_features),
      analytics: Boolean(raw && raw.analytics)
    };
  }

  function getStoredCookiePreferences() {
    try {
      const rawPreferences = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (rawPreferences) {
        return sanitizeCookiePreferences(JSON.parse(rawPreferences));
      }

      const legacyValue = window.localStorage.getItem(LEGACY_COOKIE_CONSENT_KEY);
      if (legacyValue === LEGACY_COOKIE_CONSENT_ACCEPTED) {
        return {
          required: true,
          optional_features: true,
          analytics: true
        };
      }
      if (legacyValue === LEGACY_COOKIE_CONSENT_DECLINED) {
        return {
          required: true,
          optional_features: false,
          analytics: false
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  function persistCookiePreferences(preferences) {
    const normalized = sanitizeCookiePreferences(preferences);
    try {
      window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(normalized));
      window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_KEY);
    } catch (error) {
      // ignore storage failures
    }
    return normalized;
  }

  function disableAnalytics() {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
  }

  function enableAnalytics() {
    if (window.__vionixGaConfigured === true) {
      try {
        delete window[`ga-disable-${GA_MEASUREMENT_ID}`];
      } catch (error) {
        window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
      }
      return;
    }

    try {
      delete window[`ga-disable-${GA_MEASUREMENT_ID}`];
    } catch (error) {
      window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    }

    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    const existing = document.getElementById(GA_SCRIPT_ID);
    if (existing) {
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
      window.__vionixGaConfigured = true;
      return;
    }

    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onload = () => {
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
      window.__vionixGaConfigured = true;
    };
    document.head.appendChild(script);
  }

  function applyOptionalFeatures(enabled) {
    document.querySelectorAll('[data-optional-feature="map-embed"]').forEach((iframe) => {
      const consentSrc = iframe.getAttribute('data-consent-src');
      if (!consentSrc) return;
      iframe.classList.toggle('d-none', !enabled);

      if (enabled) {
        if (!iframe.getAttribute('src')) {
          iframe.setAttribute('src', consentSrc);
        }
      } else if (iframe.getAttribute('src')) {
        iframe.removeAttribute('src');
      }
    });

    document.querySelectorAll('[data-optional-placeholder="map-embed"]').forEach((placeholder) => {
      placeholder.classList.toggle('d-none', enabled);
    });
  }

  function applyCookiePreferences(preferences) {
    const normalized = sanitizeCookiePreferences(preferences);
    applyOptionalFeatures(normalized.optional_features);

    if (normalized.analytics) {
      enableAnalytics();
    } else if (window.__vionixGaConfigured === true) {
      disableAnalytics();
    }
  }

  function ensureCookieConsentStyles() {
    if (document.getElementById('vionix-cookie-consent-styles')) return;
    const style = document.createElement('style');
    style.id = 'vionix-cookie-consent-styles';
    style.textContent = `
      .vionix-cookie-consent-banner { z-index: 1080; }
      .vionix-cookie-consent-banner .vionix-cookie-consent-card { max-width: 980px; margin: 0 auto; }
      .vionix-cookie-consent-banner .vionix-cookie-consent-title { font-weight: 600; }
      .vionix-cookie-consent-banner .vionix-cookie-consent-text { opacity: 0.95; }
      .vionix-cookie-consent-banner .vionix-cookie-consent-row { border-top: 1px solid rgba(255, 255, 255, 0.12); }
      .vionix-cookie-consent-banner .vionix-cookie-consent-row:first-of-type { border-top: 0; }
      .vionix-cookie-consent-banner .form-check-input[disabled] {
        opacity: 0.45;
        filter: grayscale(100%);
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  function removeCookieConsentBanner() {
    const existing = document.getElementById('vionix-cookie-consent-banner');
    if (existing) existing.remove();
  }

  function showCookieConsentBanner(options) {
    const force = options && options.force === true;
    const storedPreferences = getStoredCookiePreferences();
    const initialPreferences = storedPreferences || DEFAULT_COOKIE_PREFERENCES;
    if (!force && storedPreferences !== null) return;

    ensureCookieConsentStyles();
    removeCookieConsentBanner();

    const banner = document.createElement('div');
    banner.id = 'vionix-cookie-consent-banner';
    banner.className = 'vionix-cookie-consent-banner position-fixed start-0 end-0 bottom-0 p-3';
    banner.innerHTML = `
      <div class="vionix-cookie-consent-card bg-dark text-white rounded-3 shadow-lg p-3 p-md-4">
        <div class="vionix-cookie-consent-title mb-2">Privacy preferences</div>
        <div class="vionix-cookie-consent-text small mb-3">
          Required services are always active. Optional features and analytics can be disabled here.
        </div>
        <div class="vionix-cookie-consent-row py-2">
          <div class="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div class="fw-semibold small mb-1">Required services</div>
              <div class="small opacity-75">Core site operation, contact flow, and essential resources (always on).</div>
            </div>
            <div class="form-check form-switch m-0">
              <input class="form-check-input" type="checkbox" checked disabled aria-label="Required services always active">
            </div>
          </div>
        </div>
        <div class="vionix-cookie-consent-row py-2">
          <div class="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div class="fw-semibold small mb-1">Optional features</div>
              <div class="small opacity-75">Non-essential embedded features (for example, map embed).</div>
            </div>
            <div class="form-check form-switch m-0">
              <input class="form-check-input" type="checkbox" id="vionix-consent-optional-features" ${initialPreferences.optional_features ? 'checked' : ''} aria-label="Enable optional features">
            </div>
          </div>
        </div>
        <div class="vionix-cookie-consent-row py-2">
          <div class="d-flex align-items-start justify-content-between gap-3">
            <div>
              <div class="fw-semibold small mb-1">Analytics</div>
              <div class="small opacity-75">Anonymous usage analytics to measure traffic and improve content.</div>
            </div>
            <div class="form-check form-switch m-0">
              <input class="form-check-input" type="checkbox" id="vionix-consent-analytics" ${initialPreferences.analytics ? 'checked' : ''} aria-label="Enable analytics">
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end pt-3">
          <button type="button" class="btn btn-primary btn-sm" data-cookie-consent-action="save">Save preferences</button>
        </div>
      </div>
    `;

    banner.addEventListener('click', (event) => {
      const actionEl = event.target && event.target.closest ? event.target.closest('[data-cookie-consent-action]') : null;
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-cookie-consent-action');
      if (action !== 'save') return;

      const optionalFeaturesToggle = banner.querySelector('#vionix-consent-optional-features');
      const analyticsToggle = banner.querySelector('#vionix-consent-analytics');
      const preferences = persistCookiePreferences({
        required: true,
        optional_features: Boolean(optionalFeaturesToggle && optionalFeaturesToggle.checked),
        analytics: Boolean(analyticsToggle && analyticsToggle.checked)
      });
      applyCookiePreferences(preferences);
      removeCookieConsentBanner();
    });

    document.body.appendChild(banner);
  }

  function insertCookieSettingsLink() {
    const footer = document.getElementById('footer');
    if (!footer) return false;
    if (footer.querySelector('[data-cookie-settings-link]')) return true;

    let usefulLinksBlock = null;
    footer.querySelectorAll('.footer-links').forEach((block) => {
      if (usefulLinksBlock) return;
      const title = block.querySelector('h4');
      if (!title) return;
      if (String(title.textContent || '').trim().toLowerCase() === 'useful links') {
        usefulLinksBlock = block;
      }
    });
    if (!usefulLinksBlock) return false;

    const list = usefulLinksBlock.querySelector('ul');
    if (!list) return false;

    const li = document.createElement('li');
    li.innerHTML = '<i class="bi bi-chevron-right"></i> <a href="#" data-cookie-settings-link>Cookie settings</a>';
    list.appendChild(li);

    const link = li.querySelector('[data-cookie-settings-link]');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showCookieConsentBanner({ force: true });
    });
    return true;
  }

  function initCookieConsent() {
    const storedPreferences = getStoredCookiePreferences();
    applyCookiePreferences(storedPreferences || DEFAULT_COOKIE_PREFERENCES);
    insertCookieSettingsLink();
    showCookieConsentBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }

})();
