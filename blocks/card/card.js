import { addToCart } from '../../scripts/cart-utils.js';
import { toggleWishlist, isWishlisted } from '../../scripts/wishlist-utils.js';
function loadCardCSS() {
  const cssPath = '/blocks/card/card.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function dispatchCartUpdate() {
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    if (i <= Math.floor(rating)) {
      stars.push('<span class="star full">★</span>');
    } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
      stars.push('<span class="star half">★</span>');
    } else {
      stars.push('<span class="star empty">☆</span>');
    }
  }
  return stars.join('');
}

function renderColors(colorsStr) {
  if (!colorsStr) return '';
  return colorsStr.split(',').map((c) => {
    const color = c.trim();
    return `<button class="card-color-dot" style="background:${color.toLowerCase()}" title="${color}" aria-label="${color}"></button>`;
  }).join('');
}

export function buildCard(product) {
  loadCardCSS();

  const card = document.createElement('div');
  card.classList.add('card-item');

  // make card clickable — navigate to product detail page
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    // dont navigate if clicking heart, cart button, quantity wrapper, qty input or qty buttons
    if (e.target.closest('.card-heart')) return;
    if (e.target.closest('.card-cta')) return;
    if (e.target.closest('.card-qty-wrapper')) return;
    if (e.target.closest('.card-qty-btn')) return;
    if (e.target.closest('.card-qty-input')) return;
    window.location.href = `/products/product-detail-page?id=${product.id}`;
  });

  // heart wishlist button
  const heart = document.createElement('button');
  heart.classList.add('card-heart');
  heart.setAttribute('aria-label', 'Add to wishlist');

  // check if already wishlisted
  const wishlisted = isWishlisted(product.id);
  heart.innerHTML = wishlisted ? '&#9829;' : '&#9825;';
  if (wishlisted) heart.classList.add('active');

  heart.addEventListener('click', (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    heart.classList.toggle('active', added);
    heart.innerHTML = added ? '&#9829;' : '&#9825;';
  });

  // image
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('card-img');
  imgWrapper.innerHTML = `<img src="${product.image}" alt="${product.name}" loading="lazy">`;

  // details
  const details = document.createElement('div');
  details.classList.add('card-details');
  details.innerHTML = `
    <p class="card-name">${product.name}</p>
    <p class="card-type">${product.type}</p>
    <p class="card-price">${product.price}</p>
    <div class="card-rating">
      <span class="card-stars">${renderStars(parseFloat(product.rating))}</span>
      <span class="card-reviews">(${product.reviews})</span>
    </div>
    <div class="card-colors">
      ${renderColors(product.colors)}
    </div>
    <p class="card-stock">Only ${product.stock} left in stock</p>
  `;

  // Add to Cart button — navigates to PDP
  // Add to Cart button
  const btn = document.createElement('a');
  btn.href = '#';
  btn.textContent = 'Add to Cart';
  btn.classList.add('card-cta');

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    // save to cart
    addToCart({ ...product, quantity: 1 });

    // replace button with quantity selector
    const qtyWrapper = document.createElement('div');
    qtyWrapper.classList.add('card-qty-wrapper');

    const minusBtn = document.createElement('button');
    minusBtn.classList.add('card-qty-btn');
    minusBtn.textContent = '−';
    minusBtn.setAttribute('aria-label', 'Decrease quantity');

    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.classList.add('card-qty-input');
    qtyInput.value = '1';
    qtyInput.min = '0';
    qtyInput.max = product.stock || '99';

    const plusBtn = document.createElement('button');
    plusBtn.classList.add('card-qty-btn');
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', 'Increase quantity');

    function updateButtons() {
      minusBtn.disabled = parseInt(qtyInput.value, 10) <= 1;
      plusBtn.disabled = parseInt(qtyInput.value, 10) >= parseInt(product.stock || 99, 10);
    }

    minusBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const val = parseInt(qtyInput.value, 10);
      if (val > 1) {
        qtyInput.value = val - 1;
        updateButtons();
        const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const existing = cart.find((item) => String(item.id) === String(product.id));
        if (existing) {
          existing.quantity = val - 1;
          sessionStorage.setItem('cart', JSON.stringify(cart));
          window.dispatchEvent(new CustomEvent('cart-updated'));
          dispatchCartUpdate();
        }
      } else {
        const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const updated = cart.filter((item) => String(item.id) !== String(product.id));
        sessionStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cart-updated'));
        dispatchCartUpdate();
        qtyWrapper.replaceWith(btn);
      }
    });

    plusBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const val = parseInt(qtyInput.value, 10);
      const max = parseInt(product.stock || 99, 10);
      if (val < max) {
        qtyInput.value = val + 1;
        updateButtons();
        const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const existing = cart.find((item) => String(item.id) === String(product.id));
        if (existing) {
          existing.quantity = val + 1;
          sessionStorage.setItem('cart', JSON.stringify(cart));
          window.dispatchEvent(new CustomEvent('cart-updated'));
          dispatchCartUpdate();
        }
      }
    });

    qtyInput.addEventListener('change', (ev) => {
      ev.stopPropagation();
      let val = parseInt(qtyInput.value, 10);
      if (val <= 0) {
        const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
        const updated = cart.filter((item) => String(item.id) !== String(product.id));
        sessionStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cart-updated'));
        dispatchCartUpdate();
        qtyWrapper.replaceWith(btn);
        return;
      }
      const max = parseInt(product.stock || 99, 10);
      if (val > max) val = max;
      qtyInput.value = val;
      updateButtons();
      const cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
      const existing = cart.find((item) => String(item.id) === String(product.id));
      if (existing) {
        existing.quantity = val;
        sessionStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cart-updated'));
        dispatchCartUpdate();
      }
    });

    qtyWrapper.append(minusBtn);
    qtyWrapper.append(qtyInput);
    qtyWrapper.append(plusBtn);

    btn.replaceWith(qtyWrapper);
    updateButtons();
  });

  details.append(btn);

  card.append(heart);
  card.append(imgWrapper);
  card.append(details);

  return card;
}

export default function decorate(block) {
  loadCardCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const cols = [...rows[0].querySelectorAll(':scope > div')];
  const imgCol = cols[0];
  const dataCol = cols[1];
  if (!dataCol) return;

  const paras = [...dataCol.querySelectorAll('p')];
  const product = {
    image: imgCol?.querySelector('img')?.src || '',
    name: paras[0]?.textContent.trim() || '',
    type: paras[1]?.textContent.trim() || '',
    price: paras[2]?.textContent.trim() || '',
    rating: paras[3]?.textContent.trim() || '0',
    reviews: paras[4]?.textContent.trim() || '0',
    colors: paras[5]?.textContent.trim() || '',
    stock: paras[6]?.textContent.trim() || '0',
    link: dataCol.querySelector('a')?.href || '#',
  };

  const card = buildCard(product);
  block.textContent = '';
  block.append(card);
}
