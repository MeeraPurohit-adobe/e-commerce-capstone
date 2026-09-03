import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import decorateCartItems from '../cart-items/cart-items.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Builds the cart overlay panel
 */
function buildCartOverlay() {
  // backdrop
  const overlay = document.createElement('div');
  overlay.classList.add('cart-overlay-backdrop');
  document.body.append(overlay);

  // panel
  const panel = document.createElement('div');
  panel.classList.add('cart-overlay-panel');

  // panel header
  const panelHeader = document.createElement('div');
  panelHeader.classList.add('cart-overlay-header');

  const panelTitle = document.createElement('h3');
  panelTitle.classList.add('cart-overlay-title');
  panelTitle.textContent = 'Your Cart';

  const closeBtn = document.createElement('button');
  closeBtn.classList.add('cart-overlay-close');
  closeBtn.setAttribute('aria-label', 'Close cart');
  closeBtn.textContent = '✕';

  panelHeader.append(panelTitle);
  panelHeader.append(closeBtn);

  // items container
  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('cart-overlay-items');

  // footer
  const panelFooter = document.createElement('div');
  panelFooter.classList.add('cart-overlay-footer');

  const viewCartBtn = document.createElement('a');
  viewCartBtn.href = '/cart/cart';
  viewCartBtn.classList.add('cart-overlay-view-btn');
  viewCartBtn.textContent = 'View Cart';

  panelFooter.append(viewCartBtn);

  panel.append(panelHeader);
  panel.append(itemsContainer);
  panel.append(panelFooter);
  document.body.append(panel);

  // load cart-items fragment only once
  let fragmentLoaded = false;

  async function loadCartFragment() {
    if (fragmentLoaded) return;
    try {
      const resp = await fetch('/fragments/cart-items.plain.html');
      if (!resp.ok) throw new Error('Failed to fetch fragment');
      const html = await resp.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // plain.html returns main content directly
      const fragmentContent = doc.querySelector('main') || doc.body;

      if (fragmentContent) {
        itemsContainer.textContent = '';
        while (fragmentContent.firstElementChild) {
          itemsContainer.append(fragmentContent.firstElementChild);
        }

        // find and decorate the cart-items block
        const cartBlock = itemsContainer.querySelector('.cart-items');

        // eslint-disable-next-line no-console
        console.log('cart block found:', cartBlock);

        if (cartBlock) {
          decorateCartItems(cartBlock);
          fragmentLoaded = true;
        } else {
          // eslint-disable-next-line no-console
          console.log('cart-items block not found, innerHTML:', itemsContainer.innerHTML);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('loadCartFragment error:', e);
      itemsContainer.innerHTML = '<p class="cart-overlay-empty">Failed to load cart.</p>';
    }
  }

  function openPanel() {
    panel.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!fragmentLoaded) {
      loadCartFragment();
    } else {
      // fragment already loaded - just dispatch cart-updated to re-render
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  }

  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closePanel();
  });

  return { openPanel };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';

  // add promotional banner before the nav
  const promo = document.createElement('div');
  promo.className = 'nav-promotional';
  promo.innerHTML = '<p>Get <strong>15%</strong> off and free shipping with discount code "<strong>welcome</strong>"</p>';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(promo);
  navWrapper.append(nav);
  block.append(navWrapper);

  // ── CART BADGE ──
  const updateCartCount = () => {
    try {
      const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

      // try multiple selectors
      const cartIcon = navWrapper.querySelector('.nav-cart-icon')
        || navWrapper.querySelector('span[aria-label="Cart"]')
        || navWrapper.querySelector('.nav-tools p:last-of-type span')
        || navWrapper.querySelector('.nav-tools p:last-of-type');

      if (cartIcon) {
        cartIcon.style.cursor = 'pointer';
        cartIcon.style.position = 'relative';
        cartIcon.style.display = 'inline-flex';

        let badge = cartIcon.querySelector('.cart-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.classList.add('cart-badge');
          cartIcon.append(badge);
        }
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'flex' : 'none';
      }
    } catch (e) {
      // fail silently
    }
  };

  // ── CART OVERLAY ──
  // find cart icon after nav is built
  const cartIcon = navWrapper.querySelector('.nav-cart-icon')
    || navWrapper.querySelector('span[aria-label="Cart"]')
    || navWrapper.querySelector('.nav-tools p:last-of-type span')
    || navWrapper.querySelector('.nav-tools p:last-of-type');

  // always listen for cart updates regardless of icon found
  window.addEventListener('cart-updated', updateCartCount);

  if (cartIcon) {
    cartIcon.style.cursor = 'pointer';
    const { openPanel } = buildCartOverlay();
    cartIcon.addEventListener('click', openPanel);
  }

  updateCartCount();
}
