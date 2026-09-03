function loadCSS() {
  const cssPath = '/blocks/cart-items/cart-items.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem('cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
  try {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartIcon = document.querySelector('.nav-tools a[href="#cart"]')
      || document.querySelector('header a[href="#cart"]')
      || document.querySelector('header a[aria-label="Cart"]');
    if (cartIcon) {
      let badge = cartIcon.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.classList.add('cart-badge');
        cartIcon.style.position = 'relative';
        cartIcon.style.display = 'inline-flex';
        cartIcon.append(badge);
      }
      badge.textContent = totalQty;
      badge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    // fail silently
  }
}

function buildCartRow(item, onUpdate) {
  const row = document.createElement('div');
  row.classList.add('cart-item-row');

  // thumbnail
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('cart-item-thumb');
  const img = document.createElement('img');
  img.src = item.image || item['image-1'] || '';
  img.alt = item.name;
  img.loading = 'lazy';
  imgWrapper.append(img);

  // product info
  const info = document.createElement('div');
  info.classList.add('cart-item-info');

  const name = document.createElement('p');
  name.classList.add('cart-item-name');
  name.textContent = item.name;

  const price = document.createElement('p');
  price.classList.add('cart-item-price');
  price.textContent = item.price;

  info.append(name);
  info.append(price);

  // quantity controls
  const qtyWrapper = document.createElement('div');
  qtyWrapper.classList.add('cart-item-qty');

  const minusBtn = document.createElement('button');
  minusBtn.classList.add('cart-qty-btn');
  minusBtn.setAttribute('aria-label', 'Decrease quantity');
  minusBtn.textContent = '−';

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.classList.add('cart-qty-input');
  qtyInput.value = item.quantity || 1;
  qtyInput.min = '1';

  const plusBtn = document.createElement('button');
  plusBtn.classList.add('cart-qty-btn');
  plusBtn.setAttribute('aria-label', 'Increase quantity');
  plusBtn.textContent = '+';

  function updateButtons() {
    minusBtn.disabled = parseInt(qtyInput.value, 10) <= 1;
  }
  updateButtons();

  minusBtn.addEventListener('click', () => {
    const val = parseInt(qtyInput.value, 10);
    if (val > 1) {
      qtyInput.value = val - 1;
      const cart = getCart();
      const found = cart.find((i) => String(i.id) === String(item.id));
      if (found) {
        found.quantity = val - 1;
        saveCart(cart);
        updateCartIcon();
        updateButtons();
        onUpdate();
      }
    }
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(qtyInput.value, 10);
    qtyInput.value = val + 1;
    const cart = getCart();
    const found = cart.find((i) => String(i.id) === String(item.id));
    if (found) {
      found.quantity = val + 1;
      saveCart(cart);
      updateCartIcon();
      updateButtons();
      onUpdate();
    }
  });

  qtyInput.addEventListener('change', () => {
    let val = parseInt(qtyInput.value, 10);
    if (val < 1) val = 1;
    qtyInput.value = val;
    const cart = getCart();
    const found = cart.find((i) => String(i.id) === String(item.id));
    if (found) {
      found.quantity = val;
      saveCart(cart);
      updateCartIcon();
      updateButtons();
      onUpdate();
    }
  });

  qtyWrapper.append(minusBtn);
  qtyWrapper.append(qtyInput);
  qtyWrapper.append(plusBtn);

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('cart-item-delete');
  deleteBtn.setAttribute('aria-label', 'Remove item');
  deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  deleteBtn.addEventListener('click', () => {
    const cart = getCart().filter((i) => String(i.id) !== String(item.id));
    saveCart(cart);
    updateCartIcon();
    onUpdate();
  });

  row.append(imgWrapper);
  row.append(info);
  row.append(qtyWrapper);
  row.append(deleteBtn);

  return row;
}

export default function decorate(block) {
  loadCSS();

  // read column headers from HTML
  const headerRow = block.querySelector(':scope > div');
  const headers = [...(headerRow?.querySelectorAll('p') || [])].map((p) => p.textContent.trim());

  // build header
  const header = document.createElement('div');
  header.classList.add('cart-items-header');
  headers.forEach((text) => {
    const span = document.createElement('span');
    span.textContent = text;
    header.append(span);
  });
  // extra span for delete column
  header.append(document.createElement('span'));

  // items container
  const itemsContainer = document.createElement('div');
  itemsContainer.classList.add('cart-items-container');

  function renderItems() {
    itemsContainer.textContent = '';
    const cart = getCart();

    if (!cart.length) {
      const empty = document.createElement('div');
      empty.classList.add('cart-items-empty');
      empty.innerHTML = `
        <p class="cart-empty-icon">🛒</p>
        <p class="cart-empty-title">Your cart is empty</p>
        <p class="cart-empty-text">Looks like you haven't added anything yet.</p>
        <a href="/products/product-listing-page" class="cart-empty-btn">Start Shopping</a>
      `;
      itemsContainer.append(empty);
      return;
    }

    cart.forEach((item) => {
      itemsContainer.append(buildCartRow(item, renderItems));
    });
  }

  block.textContent = '';
  block.append(header);
  block.append(itemsContainer);

  renderItems();
}