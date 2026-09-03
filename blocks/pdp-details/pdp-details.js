import { renderStars } from '../card/card.js';

function loadCSS() {
  const cssPath = '/blocks/pdp-details/pdp-details.css';
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

function buildAccordionItem(title, content) {
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
    // close all other accordion items
    const allItems = item.closest('.pdp-accordion')?.querySelectorAll('.pdp-accordion-item');
    allItems?.forEach((i) => {
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

function showAddToCartSuccess(btn) {
  const original = btn.textContent;
  btn.textContent = '✓ Added to Cart!';
  btn.classList.add('pdp-cart-btn--success');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('pdp-cart-btn--success');
  }, 2000);
}

export default async function decorate(block) {
  loadCSS();

  block.innerHTML = '<p class="pdp-details-loading">Loading product details...</p>';

  const productId = getProductIdFromURL();

  try {
    let product = null;

    if (productId) {
      product = await fetchProductData(productId);
    }

    if (!product) {
      block.innerHTML = '<p class="pdp-details-error">Product not found.</p>';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.classList.add('pdp-details-wrapper');

    // ── PRODUCT NAME ──
    const name = document.createElement('h1');
    name.classList.add('pdp-name');
    name.textContent = product.name;

    // ── RATING ROW ──
    const ratingRow = document.createElement('div');
    ratingRow.classList.add('pdp-rating-row');

    const starsSpan = document.createElement('span');
    starsSpan.classList.add('pdp-stars');
    starsSpan.innerHTML = renderStars(parseFloat(product.rating));

    const reviewCount = document.createElement('span');
    reviewCount.classList.add('pdp-review-count');
    reviewCount.textContent = `(${product.reviews} reviews)`;

    ratingRow.append(starsSpan);
    ratingRow.append(reviewCount);

    // ── PRICE ──
    const price = document.createElement('p');
    price.classList.add('pdp-price');
    price.textContent = product.price;

    // ── DIVIDER ──
    const divider1 = document.createElement('hr');
    divider1.classList.add('pdp-divider');

    // ── COLORS ──
    const colorsSection = document.createElement('div');
    colorsSection.classList.add('pdp-section');

    const colorsLabel = document.createElement('p');
    colorsLabel.classList.add('pdp-label');
    colorsLabel.textContent = 'Color:';

    const colorsWrapper = document.createElement('div');
    colorsWrapper.classList.add('pdp-colors');

    const colorsList = product.colors ? product.colors.split(',') : [];
    colorsList.forEach((color) => {
      const dot = document.createElement('button');
      dot.classList.add('pdp-color-dot');
      dot.style.background = color.trim().toLowerCase();
      dot.setAttribute('aria-label', color.trim());
      dot.setAttribute('title', color.trim());
      dot.addEventListener('click', () => {
        colorsWrapper.querySelectorAll('.pdp-color-dot')
          .forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
      });
      colorsWrapper.append(dot);
    });

    colorsSection.append(colorsLabel);
    colorsSection.append(colorsWrapper);

    // ── SIZES ──
    const sizesSection = document.createElement('div');
    sizesSection.classList.add('pdp-section');

    const sizesLabel = document.createElement('p');
    sizesLabel.classList.add('pdp-label');
    sizesLabel.textContent = 'Size:';

    const sizesWrapper = document.createElement('div');
    sizesWrapper.classList.add('pdp-sizes');

    const sizesList = product.size ? product.size.split(',') : ['Small', 'Medium', 'Large'];
    sizesList.forEach((size) => {
      const btn = document.createElement('button');
      btn.classList.add('pdp-size-btn');
      btn.textContent = size.trim();
      btn.addEventListener('click', () => {
        sizesWrapper.querySelectorAll('.pdp-size-btn')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      sizesWrapper.append(btn);
    });

    sizesSection.append(sizesLabel);
    sizesSection.append(sizesWrapper);

    // ── STOCK ──
    const stock = document.createElement('p');
    stock.classList.add('pdp-stock');
    stock.textContent = `Only ${product.stock} left in stock`;

    // ── ADD TO CART ──
    const cartBtn = document.createElement('button');
    cartBtn.classList.add('pdp-cart-btn');
    cartBtn.textContent = 'Add to Cart';
    cartBtn.addEventListener('click', () => showAddToCartSuccess(cartBtn));

    // ── DIVIDER ──
    const divider2 = document.createElement('hr');
    divider2.classList.add('pdp-divider');

    // ── ACCORDION ──
    const accordion = document.createElement('div');
    accordion.classList.add('pdp-accordion');

    accordion.append(buildAccordionItem('Description', product.description));
    accordion.append(buildAccordionItem('Care Instructions', product.care));
    accordion.append(buildAccordionItem('Shipping & Returns', product.shipping));
    accordion.append(buildAccordionItem('Reviews', `${product.reviews} verified reviews. Average rating ${product.rating} out of 5 stars.`));

    // ── ASSEMBLE ──
    wrapper.append(name);
    wrapper.append(ratingRow);
    wrapper.append(price);
    wrapper.append(divider1);
    wrapper.append(colorsSection);
    wrapper.append(sizesSection);
    wrapper.append(stock);
    wrapper.append(cartBtn);
    wrapper.append(divider2);
    wrapper.append(accordion);

    block.textContent = '';
    block.append(wrapper);

  } catch (e) {
    block.innerHTML = '<p class="pdp-details-error">Failed to load product details.</p>';
  }
}
