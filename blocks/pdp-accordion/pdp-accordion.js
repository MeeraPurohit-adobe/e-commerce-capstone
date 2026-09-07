import {
  getSlugFromURL,
  getIdFromURL,
  fetchProductBySlug,
  fetchProductById,
} from '../../scripts/product-utils.js';

function loadCSS() {
  const cssPath = '/blocks/pdp-accordion/pdp-accordion.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function buildAccordionItem(title, content, accordion) {
  const item = document.createElement('div');
  item.classList.add('pdp-accordion-item');

  const header = document.createElement('button');
  header.classList.add('pdp-accordion-header');
  header.setAttribute('aria-expanded', 'false');

  const titleSpan = document.createElement('span');
  titleSpan.textContent = title;

  // downward arrow SVG
  const icon = document.createElement('span');
  icon.classList.add('pdp-accordion-icon');
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  header.append(titleSpan);
  header.append(icon);

  const body = document.createElement('div');
  body.classList.add('pdp-accordion-body');

  const bodyText = document.createElement('p');
  bodyText.textContent = content || 'Coming soon...';
  body.append(bodyText);

  header.addEventListener('click', () => {
    const isExpanded = header.getAttribute('aria-expanded') === 'true';

    // close all other items
    accordion.querySelectorAll('.pdp-accordion-item').forEach((i) => {
      if (i !== item) {
        i.querySelector('.pdp-accordion-header').setAttribute('aria-expanded', 'false');
        i.querySelector('.pdp-accordion-body').classList.remove('open');
      }
    });

    // toggle current
    header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    body.classList.toggle('open', !isExpanded);
  });

  item.append(header);
  item.append(body);
  return item;
}

export default async function decorate(block) {
  loadCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const sections = rows.map((row) => {
    const paras = [...row.querySelectorAll('p')];
    return {
      title: paras[0]?.textContent.trim() || '',
      key: paras[1]?.textContent.trim() || '',
    };
  });

  block.innerHTML = '<p class="pdp-accordion-loading">Loading...</p>';

  try {
    let product = null;

    // ── STEP 1: try slug from /pages/products/<slug> ──
    const slug = getSlugFromURL();
    if (slug) {
      product = await fetchProductBySlug(slug);
    }

    // ── STEP 2: fallback to ?id= param ──
    if (!product) {
      const id = getIdFromURL();
      if (id) product = await fetchProductById(id);
    }

    const accordion = document.createElement('div');
    accordion.classList.add('pdp-accordion-wrapper');

    sections.forEach(({ title, key }) => {
      let content = '';
      if (product && product[key]) {
        content = product[key];
      }
      accordion.append(buildAccordionItem(title, content, accordion));
    });

    block.textContent = '';
    block.append(accordion);
  } catch (e) {
    block.innerHTML = '<p class="pdp-accordion-error">Failed to load content.</p>';
  }
}
