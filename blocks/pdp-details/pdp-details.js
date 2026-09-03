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
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get('id');
  return id || '';
}

async function fetchProductData(productId) {
  try {
    const resp = await fetch('/data/plants-listing.json?limit=1000');
    if (!resp.ok) throw new Error(`HTTP error: ${resp.status}`);
    const json = await resp.json();
    const products = json.data || [];
    return products.find((p) => String(p.id) === String(productId)) || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('fetchProductData error:', e.message);
    return null;
  }
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

function buildQuantitySelector(stock) {
  const maxQty = parseInt(stock, 10) || 99;

  const wrapper = document.createElement('div');
  wrapper.classList.add('pdp-quantity');

  const minusBtn = document.createElement('button');
  minusBtn.classList.add('pdp-quantity-btn');
  minusBtn.setAttribute('aria-label', 'Decrease quantity');
  minusBtn.textContent = '−';

  const input = document.createElement('input');
  input.type = 'number';
  input.classList.add('pdp-quantity-input');
  input.value = '1';
  input.min = '1';
  input.max = maxQty;
  input.setAttribute('aria-label', 'Quantity');

  const plusBtn = document.createElement('button');
  plusBtn.classList.add('pdp-quantity-btn');
  plusBtn.setAttribute('aria-label', 'Increase quantity');
  plusBtn.textContent = '+';

  // update button states
  function updateButtons() {
    const val = parseInt(input.value, 10);
    minusBtn.disabled = val <= 1;
    plusBtn.disabled = val >= maxQty;
  }

  // initial state - minus disabled at 1
  updateButtons();

  minusBtn.addEventListener('click', () => {
    const val = parseInt(input.value, 10);
    if (val > 1) {
      input.value = val - 1;
      updateButtons();
    }
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(input.value, 10);
    if (val < maxQty) {
      input.value = val + 1;
      updateButtons();
    }
  });

  input.addEventListener('change', () => {
    let val = parseInt(input.value, 10);
    if (val < 1) val = 1;
    if (val > maxQty) val = maxQty;
    input.value = val;
    updateButtons();
  });

  wrapper.append(minusBtn);
  wrapper.append(input);
  wrapper.append(plusBtn);
  return wrapper;
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

    // update breadcrumb - try multiple times to handle async rendering
    const updateBreadcrumb = () => {
    const breadcrumbName = document.querySelector('.pdp-breadcrumb-name');
    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
        // remove hidden class if breadcrumb item was hidden
        const li = breadcrumbName.closest('.breadcrumb-item');
        if (li) li.classList.remove('breadcrumb-hidden');
      }
    };

    updateBreadcrumb();
    setTimeout(updateBreadcrumb, 300);
    setTimeout(updateBreadcrumb, 800);

    const wrapper = document.createElement('div');
    wrapper.classList.add('pdp-details-wrapper');

    // ── NAME ──
    const name = document.createElement('h1');
    name.classList.add('pdp-name');
    name.textContent = product.name;

    // ── RATING ──
    const ratingRow = document.createElement('div');
    ratingRow.classList.add('pdp-rating-row');

    const starsSpan = document.createElement('span');
    starsSpan.classList.add('pdp-stars');
    starsSpan.innerHTML = renderStars(parseFloat(product.rating));

    const separator = document.createElement('span');
    separator.classList.add('pdp-rating-separator');
    separator.textContent = '|';

    const reviewCount = document.createElement('span');
    reviewCount.classList.add('pdp-review-count');
    reviewCount.textContent = `${product.reviews} reviews`;

    ratingRow.append(starsSpan);
    ratingRow.append(separator);
    ratingRow.append(reviewCount);

    // ── PRICE ──
    const price = document.createElement('p');
    price.classList.add('pdp-price');
    price.textContent = product.price;

    // ── SHORT DESCRIPTION after price ──
    const shortDesc = document.createElement('p');
    shortDesc.classList.add('pdp-short-desc');
    shortDesc.textContent = product.description || '';

    // ── DIVIDER ──
    const divider = document.createElement('hr');
    divider.classList.add('pdp-divider');

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

    const sizesList = product.size
      ? product.size.split(',')
      : ['Small', 'Medium', 'Large'];

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

    // ── QUANTITY + ADD TO CART row ──
    // ── QUANTITY + ADD TO CART + WISHLIST ──
    const cartRow = document.createElement('div');
    cartRow.classList.add('pdp-cart-row');

    const quantitySelector = buildQuantitySelector(product.stock);

    const cartBtn = document.createElement('button');
    cartBtn.classList.add('pdp-cart-btn');
    cartBtn.textContent = 'Add to Cart';
    cartBtn.addEventListener('click', () => showAddToCartSuccess(cartBtn));

    // wishlist heart button
    const wishlistBtn = document.createElement('button');
    wishlistBtn.classList.add('pdp-wishlist-btn');
    wishlistBtn.setAttribute('aria-label', 'Add to wishlist');
    wishlistBtn.innerHTML = '&#9825;';
    wishlistBtn.addEventListener('click', () => {
      wishlistBtn.classList.toggle('active');
      wishlistBtn.innerHTML = wishlistBtn.classList.contains('active') ? '&#9829;' : '&#9825;';
    });

    cartRow.append(quantitySelector);
    cartRow.append(cartBtn);
    cartRow.append(wishlistBtn);

    // ── DESCRIPTION after Add to Cart ──
    const descSection = document.createElement('div');
    descSection.classList.add('pdp-description');

    const descTitle = document.createElement('h3');
    descTitle.classList.add('pdp-description-title');
    descTitle.textContent = 'Description';

    const descText = document.createElement('p');
    descText.classList.add('pdp-description-text');
    descText.textContent = product.description || 'No description available.';

    descSection.append(descTitle);
    descSection.append(descText);

    // ── ASSEMBLE ──
    wrapper.append(name);
    wrapper.append(ratingRow);
    wrapper.append(price);
    wrapper.append(shortDesc);
    wrapper.append(divider);
    wrapper.append(colorsSection);
    wrapper.append(sizesSection);
    wrapper.append(stock);
    wrapper.append(cartRow);
    wrapper.append(descSection);

    block.textContent = '';
    block.append(wrapper);

  } catch (e) {
  // eslint-disable-next-line no-console
  console.error('pdp-details decorate error:', e.message, e.stack);
  block.innerHTML = `<p class="pdp-details-error">Error: ${e.message}</p>`;
}
}
