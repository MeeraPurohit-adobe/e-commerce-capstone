function loadCSS() {
  const cssPath = '/blocks/pdp-accordion/pdp-accordion.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

async function fetchProductData(productId) {
  const resp = await fetch('/data/plants-listing.json?limit=1000');
  if (!resp.ok) throw new Error('Failed to fetch');
  const json = await resp.json();
  const products = json.data || [];
  return products.find((p) => p.name.toLowerCase().replace(/ /g, '-') === productId);
}

function buildAccordionItem(title, content, accordion) {
  const item = document.createElement('div');
  item.classList.add('pdp-accordion-item');

  const header = document.createElement('button');
  header.classList.add('pdp-accordion-header');
  header.setAttribute('aria-expanded', 'false');

  const titleSpan = document.createElement('span');
  titleSpan.textContent = title;

  const icon = document.createElement('span');
  icon.classList.add('pdp-accordion-icon');
  icon.textContent = '+';

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
        i.querySelector('.pdp-accordion-icon').textContent = '+';
        i.querySelector('.pdp-accordion-body').classList.remove('open');
      }
    });

    // toggle current
    header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    icon.textContent = isExpanded ? '+' : '−';
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

  // read section titles and sheet keys from block content
  const sections = rows.map((row) => {
    const paras = [...row.querySelectorAll('p')];
    return {
      title: paras[0]?.textContent.trim() || '',
      key: paras[1]?.textContent.trim() || '',
    };
  });

  // show loading
  block.innerHTML = '<p class="pdp-accordion-loading">Loading...</p>';

  try {
    const productId = getProductIdFromURL();
    let product = null;

    if (productId) {
      product = await fetchProductData(productId);
    }

    const accordion = document.createElement('div');
    accordion.classList.add('pdp-accordion-wrapper');

    sections.forEach(({ title, key }) => {
      // get content from product sheet data
      let content = '';
      if (product && product[key]) {
        content = product[key];
      } else if (key === 'reviews' && product) {
        content = `${product.reviews} verified reviews. Average rating ${product.rating} out of 5 stars.`;
      }
      accordion.append(buildAccordionItem(title, content, accordion));
    });

    block.textContent = '';
    block.append(accordion);

  } catch (e) {
    block.innerHTML = '<p class="pdp-accordion-error">Failed to load content.</p>';
  }
}