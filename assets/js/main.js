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
   * Apply .scrolled class to the body as the page is scrolled down
   */
  let scrolledActive = false;
  let scrollTransitionLock = false;
  const ENTER_THRESHOLD = 150; // past this, collapse topbar
  const EXIT_THRESHOLD = 20;   // only restore when very near the top
  const TOPBAR_TRANSITION_MS = 550; // match CSS transition to avoid mid-animation re-eval

  function buildCollapsedLink(sourceLink, iconClass, fallbackText) {
    if (!sourceLink) return null;

    const collapsedLink = document.createElement('a');
    collapsedLink.className = 'header-collapsed-link';
    collapsedLink.href = sourceLink.href;
    collapsedLink.textContent = '';

    if (sourceLink.target) collapsedLink.target = sourceLink.target;
    if (sourceLink.rel) collapsedLink.rel = sourceLink.rel;

    const icon = document.createElement('i');
    icon.className = iconClass;
    icon.setAttribute('aria-hidden', 'true');
    collapsedLink.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = sourceLink.textContent.trim() || fallbackText;
    collapsedLink.appendChild(text);

    return collapsedLink;
  }

  function initCollapsedTopbarLinks() {
    document.querySelectorAll('#header').forEach((header) => {
      const brandingContainer = header.querySelector('.branding .container');
      const logo = brandingContainer ? brandingContainer.querySelector('.logo') : null;
      if (!brandingContainer || !logo) return;

      let brandStack = brandingContainer.querySelector('.header-brand-stack');
      if (!brandStack) {
        brandStack = document.createElement('div');
        brandStack.className = 'header-brand-stack d-flex flex-column';
        logo.parentNode.insertBefore(brandStack, logo);
        brandStack.appendChild(logo);
      }

      if (brandStack.querySelector('.header-collapsed-links')) return;

      const topbarEmail = header.querySelector('.topbar .bi-envelope a');
      const topbarCta = header.querySelector('.topbar .bi-calendar4-week a');
      if (!topbarEmail && !topbarCta) return;

      const linksWrap = document.createElement('div');
      linksWrap.className = 'header-collapsed-links';

      const collapsedCta = buildCollapsedLink(topbarCta, 'bi bi-calendar4-week', 'Schedule a Call');
      const collapsedEmail = buildCollapsedLink(topbarEmail, 'bi bi-envelope', 'info@vionix.cloud');

      if (collapsedEmail) linksWrap.appendChild(collapsedEmail);
      if (collapsedCta) linksWrap.appendChild(collapsedCta);
      if (linksWrap.children.length === 0) return;

      brandStack.appendChild(linksWrap);
    });
  }

  function toggleScrolled() {
    const body = document.body;
    const header = document.querySelector('#header');
    if (!header || (!header.classList.contains('scroll-up-sticky') && !header.classList.contains('sticky-top') && !header.classList.contains('fixed-top'))) return;
    if (scrollTransitionLock) return;

    const y = window.scrollY;
    const shouldBeScrolled = scrolledActive ? y > EXIT_THRESHOLD : y > ENTER_THRESHOLD;
    if (shouldBeScrolled === scrolledActive) return;

    scrolledActive = shouldBeScrolled;
    body.classList.toggle('scrolled', scrolledActive);

    // Avoid flip-flop while the topbar height transition runs
    scrollTransitionLock = true;
    setTimeout(() => {
      scrollTransitionLock = false;
    }, TOPBAR_TRANSITION_MS);
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', initCollapsedTopbarLinks);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

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
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

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
        trackFormSubmitEvent('form_submit', form);
        form.reset();
      } catch (submissionError) {
        if (error) {
          error.textContent = submissionError.message;
          error.classList.add('d-block');
        }
      } finally {
        if (loading) loading.classList.remove('d-block');
      }
    });
  });

  /**
   * Google Analytics 4 (consent-gated)
   *
   * Requirements:
   * - Do not load GA until consent is granted.
   * - Track CTA clicks and form submits after consent.
   */
  const GA4_MEASUREMENT_ID = 'G-THRH69PMFC';
  const ANALYTICS_CONSENT_KEY = 'vionix_analytics_consent_v1';
  const CONSENT_GRANTED = 'granted';
  const CONSENT_DENIED = 'denied';

  function isLocalPreview() {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '';
  }

  function getAnalyticsConsent() {
    try {
      const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
      if (value === CONSENT_GRANTED || value === CONSENT_DENIED) return value;
      return null;
    } catch (error) {
      return null;
    }
  }

  function setAnalyticsConsent(value) {
    try {
      window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    } catch (error) {
      // ignore storage failures (private mode / disabled storage)
    }
  }

  function isAnalyticsEnabled() {
    return getAnalyticsConsent() === CONSENT_GRANTED;
  }

  function ensureGtagLoaded() {
    if (isLocalPreview()) return false;
    if (window.__vionixGa4Loaded) return true;
    window.__vionixGa4Loaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    return true;
  }

  function initGa4(consent) {
    if (isLocalPreview()) return false;
    ensureGtagLoaded();
    if (typeof window.gtag !== 'function') return false;

    const analyticsStorage = consent === CONSENT_GRANTED ? CONSENT_GRANTED : CONSENT_DENIED;

    // Consent Mode: load the Google tag, but keep analytics storage denied until the user grants consent.
    // This is required for Google's tag diagnostics to detect the tag on initial load.
    window.gtag('consent', 'default', {
      analytics_storage: analyticsStorage,
      ad_storage: CONSENT_DENIED,
      ad_user_data: CONSENT_DENIED,
      ad_personalization: CONSENT_DENIED
    });

    window.gtag('config', GA4_MEASUREMENT_ID, {
      send_page_view: analyticsStorage === CONSENT_GRANTED
    });

    return true;
  }

  function applyAnalyticsConsentUpdate(consent) {
    if (isLocalPreview()) return false;
    ensureGtagLoaded();
    if (typeof window.gtag !== 'function') return false;

    if (consent === CONSENT_GRANTED) {
      window.gtag('consent', 'update', { analytics_storage: CONSENT_GRANTED });
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search + window.location.hash
      });
    } else {
      window.gtag('consent', 'update', { analytics_storage: CONSENT_DENIED });
    }
    return true;
  }

  function trackEvent(name, params) {
    if (!isAnalyticsEnabled()) return false;
    ensureGtagLoaded();
    if (typeof window.gtag !== 'function') return false;
    try {
      window.gtag('event', name, Object.assign({ transport_type: 'beacon' }, params || {}));
      return true;
    } catch (error) {
      return false;
    }
  }

  function safeTrimText(value) {
    if (!value) return '';
    return String(value).replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function closestSectionId(el) {
    const section = el && el.closest ? el.closest('section[id]') : null;
    return section ? section.getAttribute('id') : '';
  }

  function isCtaElement(el) {
    if (!el) return false;
    if (el.hasAttribute && el.hasAttribute('data-ga-cta')) return true;
    if (el.matches && (el.matches('a.btn') || el.matches('button.btn'))) return true;
    if (el.classList && (el.classList.contains('btn-get-started') || el.classList.contains('btn-watch-video'))) return true;
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (href.includes('cal.com/vionix-consulting/schedule-a-call')) return true;
      if (href === '#contact' || href.endsWith('#contact') || href.includes('index.html#contact')) return true;
    }
    return false;
  }

  function trackCtaClickEvent(el) {
    if (!el) return;
    const href = el.tagName === 'A' ? (el.getAttribute('href') || '') : '';
    trackEvent('cta_click', {
      cta_text: safeTrimText(el.textContent),
      cta_href: href,
      cta_id: el.id || '',
      cta_section: closestSectionId(el),
      cta_classes: el.className ? String(el.className).slice(0, 160) : ''
    });
  }

  function trackFormSubmitEvent(eventName, form) {
    if (!form) return;
    trackEvent(eventName, {
      form_id: form.id || '',
      form_name: form.getAttribute('name') || '',
      form_action: form.getAttribute('action') || '',
      form_method: (form.getAttribute('method') || 'get').toLowerCase(),
      form_section: closestSectionId(form)
    });
  }

  function ensureConsentStyles() {
    if (document.getElementById('vionix-consent-styles')) return;
    const style = document.createElement('style');
    style.id = 'vionix-consent-styles';
    style.textContent = `
      .vionix-consent-banner { z-index: 1080; }
      .vionix-consent-banner .vionix-consent-card { max-width: 980px; margin: 0 auto; }
      .vionix-consent-banner .vionix-consent-title { font-weight: 600; }
      .vionix-consent-banner .vionix-consent-text { opacity: 0.95; }
    `;
    document.head.appendChild(style);
  }

  function removeConsentBanner() {
    const existing = document.getElementById('vionix-consent-banner');
    if (existing) existing.remove();
  }

  function showConsentBanner(options) {
    const force = options && options.force === true;
    if (!force && getAnalyticsConsent() !== null) return;

    ensureConsentStyles();
    removeConsentBanner();

    const banner = document.createElement('div');
    banner.id = 'vionix-consent-banner';
    banner.className = 'vionix-consent-banner position-fixed start-0 end-0 bottom-0 p-3';
    banner.innerHTML = `
      <div class="vionix-consent-card bg-dark text-white rounded-3 shadow-lg p-3 p-md-4">
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
            <div class="me-md-3">
              <div class="vionix-consent-title mb-1">Analytics consent</div>
              <div class="vionix-consent-text small">
              Vionix uses Google Analytics to understand site usage and improve pages. Analytics storage stays disabled unless consent is granted.
              </div>
            </div>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-outline-light btn-sm" data-consent-action="deny">Decline</button>
            <button type="button" class="btn btn-primary btn-sm" data-consent-action="accept">Accept</button>
          </div>
        </div>
      </div>
    `;

    banner.addEventListener('click', (event) => {
      const actionEl = event.target && event.target.closest ? event.target.closest('[data-consent-action]') : null;
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-consent-action');
      if (action === 'accept') {
        setAnalyticsConsent(CONSENT_GRANTED);
        applyAnalyticsConsentUpdate(CONSENT_GRANTED);
        removeConsentBanner();
      } else if (action === 'deny') {
        setAnalyticsConsent(CONSENT_DENIED);
        applyAnalyticsConsentUpdate(CONSENT_DENIED);
        removeConsentBanner();
      }
    });

    document.body.appendChild(banner);
  }

  function openCookieSettings() {
    applyAnalyticsConsentUpdate(CONSENT_DENIED);
    try {
      window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    } catch (error) {
      // ignore
    }
    showConsentBanner({ force: true });
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
      if (safeTrimText(title.textContent).toLowerCase() === 'useful links') {
        usefulLinksBlock = block;
      }
    });
    if (!usefulLinksBlock) return false;

    const list = usefulLinksBlock.querySelector('ul');
    if (!list) return false;

    const li = document.createElement('li');
    li.innerHTML = `<i class="bi bi-chevron-right"></i> <a href="#" data-cookie-settings-link>Cookie settings</a>`;
    list.appendChild(li);

    const link = li.querySelector('[data-cookie-settings-link]');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openCookieSettings();
    });
    return true;
  }

  function initAnalyticsAndTracking() {
    const consent = getAnalyticsConsent();
    initGa4(consent);
    if (consent !== CONSENT_GRANTED && consent !== CONSENT_DENIED) {
      showConsentBanner();
    }

    insertCookieSettingsLink();

    document.addEventListener('click', (event) => {
      if (!isAnalyticsEnabled()) return;
      const target = event.target && event.target.closest ? event.target.closest('a,button') : null;
      if (!target) return;
      if (!isCtaElement(target)) return;
      trackCtaClickEvent(target);
    }, { capture: true });

    document.addEventListener('submit', (event) => {
      if (!isAnalyticsEnabled()) return;
      const form = event.target;
      if (!form || form.tagName !== 'FORM') return;
      if (form.hasAttribute('data-basin-form')) return; // Basin uses AJAX; track on success instead.
      trackFormSubmitEvent('form_submit', form);
    }, { capture: true });
  }

  window.addEventListener('load', initAnalyticsAndTracking);

})();
