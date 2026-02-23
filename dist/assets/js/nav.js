/**
* Homepage navigation and header behavior.
*/
(function() {
  "use strict";

  let scrolledActive = false;
  let scrollTransitionLock = false;
  const ENTER_THRESHOLD = 150;
  const EXIT_THRESHOLD = 20;
  const TOPBAR_TRANSITION_MS = 550;

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

      const topbarEmail = header.querySelector('.topbar .topbar-email-link') || header.querySelector('.topbar .bi-envelope a');
      const topbarCta = header.querySelector('.topbar .topbar-cta-link') || header.querySelector('.topbar .bi-calendar4-week a');
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

    scrollTransitionLock = true;
    setTimeout(() => {
      scrollTransitionLock = false;
    }, TOPBAR_TRANSITION_MS);
  }

  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  const desktopNavMediaQuery = window.matchMedia('(min-width: 1200px)');

  function syncDropdownToggleMode() {
    const isDesktop = desktopNavMediaQuery.matches;
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach((toggleBtn) => {
      const dropdownItem = toggleBtn.closest('.dropdown');
      const submenu = dropdownItem ? dropdownItem.querySelector(':scope > ul') : null;

      if (isDesktop) {
        toggleBtn.setAttribute('tabindex', '-1');
        toggleBtn.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (dropdownItem) dropdownItem.classList.remove('active');
        if (submenu) submenu.classList.remove('dropdown-active');
        return;
      }

      toggleBtn.removeAttribute('tabindex');
      toggleBtn.removeAttribute('aria-hidden');
    });
  }

  function mobileNavToggle() {
    const body = document.querySelector('body');
    body.classList.toggle('mobile-nav-active');
    const expanded = body.classList.contains('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
    mobileNavToggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    mobileNavToggleBtn.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  }

  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToggle);
  }

  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToggle();
      }
    });
  });

  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      if (desktopNavMediaQuery.matches) {
        return;
      }
      e.preventDefault();
      const dropdownItem = this.closest('.dropdown');
      if (!dropdownItem) return;
      const submenu = dropdownItem.querySelector(':scope > ul');
      if (!submenu) return;
      dropdownItem.classList.toggle('active');
      submenu.classList.toggle('dropdown-active');
      const expanded = dropdownItem.classList.contains('active');
      this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      e.stopImmediatePropagation();
    });
  });

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', initCollapsedTopbarLinks);
  window.addEventListener('load', toggleScrolled);
  window.addEventListener('load', syncDropdownToggleMode);
  desktopNavMediaQuery.addEventListener('change', syncDropdownToggleMode);
})();
