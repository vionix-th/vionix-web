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
   * Cookie consent preferences with GA4 consent mode integration
   */
  const COOKIE_CONSENT_KEY = 'vionix_cookie_consent_v1';
  const COOKIE_CONSENT_ACCEPTED = 'accepted';
  const COOKIE_CONSENT_DECLINED = 'declined';
  const GA_MEASUREMENT_ID = 'G-THRH69PMFC';

  function getCookieConsent() {
    try {
      const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_DECLINED) return value;
      return null;
    } catch (error) {
      return null;
    }
  }

  function setCookieConsent(value) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (error) {
      // ignore storage failures
    }
  }

  function clearCookieConsent() {
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch (error) {
      // ignore storage failures
    }
  }

  function hasGtag() {
    return typeof window.gtag === 'function';
  }

  function updateAnalyticsConsent(granted) {
    if (!hasGtag()) return;
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function configureAnalyticsIfNeeded() {
    if (!hasGtag()) return;
    if (window.__vionixGaConfigured === true) return;
    window.gtag('config', GA_MEASUREMENT_ID);
    window.__vionixGaConfigured = true;
  }

  function syncAnalyticsWithConsent() {
    const consent = getCookieConsent();
    if (consent === COOKIE_CONSENT_ACCEPTED) {
      updateAnalyticsConsent(true);
      configureAnalyticsIfNeeded();
      return;
    }
    updateAnalyticsConsent(false);
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
    `;
    document.head.appendChild(style);
  }

  function removeCookieConsentBanner() {
    const existing = document.getElementById('vionix-cookie-consent-banner');
    if (existing) existing.remove();
  }

  function showCookieConsentBanner(options) {
    const force = options && options.force === true;
    if (!force && getCookieConsent() !== null) return;

    ensureCookieConsentStyles();
    removeCookieConsentBanner();

    const banner = document.createElement('div');
    banner.id = 'vionix-cookie-consent-banner';
    banner.className = 'vionix-cookie-consent-banner position-fixed start-0 end-0 bottom-0 p-3';
    banner.innerHTML = `
      <div class="vionix-cookie-consent-card bg-dark text-white rounded-3 shadow-lg p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div class="me-md-3">
            <div class="vionix-cookie-consent-title mb-1">Cookie preferences</div>
            <div class="vionix-cookie-consent-text small">
              Vionix stores limited preferences in this browser. Caesar can update this choice any time in Cookie settings.
            </div>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-outline-light btn-sm" data-cookie-consent-action="decline">Decline</button>
            <button type="button" class="btn btn-primary btn-sm" data-cookie-consent-action="accept">Accept</button>
          </div>
        </div>
      </div>
    `;

    banner.addEventListener('click', (event) => {
      const actionEl = event.target && event.target.closest ? event.target.closest('[data-cookie-consent-action]') : null;
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-cookie-consent-action');
      if (action === 'accept') {
        setCookieConsent(COOKIE_CONSENT_ACCEPTED);
        syncAnalyticsWithConsent();
      } else if (action === 'decline') {
        setCookieConsent(COOKIE_CONSENT_DECLINED);
        syncAnalyticsWithConsent();
      }
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
      clearCookieConsent();
      updateAnalyticsConsent(false);
      showCookieConsentBanner({ force: true });
    });
    return true;
  }

  function initCookieConsent() {
    syncAnalyticsWithConsent();
    insertCookieSettingsLink();
    showCookieConsentBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    initCookieConsent();
  }

})();
