function loadCSS() {
  const cssPath = '/blocks/order-summary/order-summary.css';
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

function getRandomAmount(max) {
  return Math.floor(Math.random() * max) + 1;
}

export default function decorate(block) {
  loadCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // read values from HTML
  const discountMax = parseInt(rows[2]?.querySelector('p:last-child')?.textContent || '20', 10);
  const giftMax = parseInt(rows[3]?.querySelector('p:last-child')?.textContent || '10', 10);
  const taxMax = parseInt(rows[4]?.querySelector('p:last-child')?.textContent || '30', 10);
  const shippingMax = parseInt(rows[5]?.querySelector('p:last-child')?.textContent || '10', 10);

  // read button links from HTML
  const continueLink = rows[8]?.querySelector('a:first-child')?.href || '/products/product-listing-page';
  const checkoutLink = rows[8]?.querySelector('a:last-child')?.href || '/cart/review-order';

  // generate random values
  const discount = getRandomAmount(discountMax);
  const gift = getRandomAmount(giftMax);
  const tax = getRandomAmount(taxMax);
  const shipping = getRandomAmount(shippingMax);

  // build wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('order-summary-wrapper');

  // title
  const title = document.createElement('h3');
  title.classList.add('order-summary-title');
  title.textContent = 'Order Summary';

  // calculate subtotal from cart
  function getSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => {
      const price = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      return sum + price * (item.quantity || 1);
    }, 0);
  }

  // build summary rows
  function buildRow(label, value, cls = '') {
    const row = document.createElement('div');
    row.classList.add('order-summary-row');
    if (cls) row.classList.add(cls);

    const labelEl = document.createElement('span');
    labelEl.classList.add('order-summary-label');
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.classList.add('order-summary-value');
    valueEl.textContent = value;

    row.append(labelEl);
    row.append(valueEl);
    return row;
  }

  // promo code section
  const promoSection = document.createElement('div');
  promoSection.classList.add('order-summary-promo');

  const promoLabel = document.createElement('p');
  promoLabel.classList.add('order-summary-promo-label');
  promoLabel.textContent = 'Promo Code';

  const promoInputRow = document.createElement('div');
  promoInputRow.classList.add('order-summary-promo-row');

  const promoInput = document.createElement('input');
  promoInput.type = 'text';
  promoInput.classList.add('order-summary-promo-input');
  promoInput.placeholder = 'Enter promo code';

  const promoBtn = document.createElement('button');
  promoBtn.classList.add('order-summary-promo-btn');
  promoBtn.textContent = 'Apply';

  let promoDiscount = 0;

  promoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toLowerCase();
    if (code === 'welcome') {
      promoDiscount = 50;
      promoInput.classList.add('valid');
      promoInput.classList.remove('invalid');
    } else if (code) {
      promoDiscount = 0;
      promoInput.classList.add('invalid');
      promoInput.classList.remove('valid');
    }
    renderSummary();
  });

  promoInputRow.append(promoInput);
  promoInputRow.append(promoBtn);

  promoSection.append(promoLabel);
  promoSection.append(promoInputRow);

  // divider
  const divider = document.createElement('hr');
  divider.classList.add('order-summary-divider');

  // total row placeholder
  const totalRow = buildRow('Total', '₹0', 'order-summary-total');

  // buttons
  const continueBtn = document.createElement('a');
  continueBtn.href = continueLink;
  continueBtn.classList.add('order-summary-continue-btn');
  continueBtn.textContent = 'Continue Shopping';

  const checkoutBtn = document.createElement('button');
  checkoutBtn.classList.add('order-summary-checkout-btn');
  checkoutBtn.textContent = 'Proceed to Checkout';
  checkoutBtn.addEventListener('click', () => {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');

    if (loggedInUser) {
      // already logged in — go directly
      window.location.href = '/account/account';
      return;
    }

    // not logged in — find and open popup
    // try immediately then retry in case fragment not loaded yet
    const tryOpenPopup = () => {
      const popup = document.querySelector('.login-popup-overlay');
      if (popup) {
        popup.classList.add('active');
        document.body.style.overflow = 'hidden';
        return true;
      }
      return false;
    };

    if (!tryOpenPopup()) {
      setTimeout(tryOpenPopup, 300);
      setTimeout(tryOpenPopup, 800);
    }
  });

  // subtotal row placeholder
  const subtotalRow = buildRow('Subtotal', '₹0');
  const discountRow = buildRow(`Discount`, `-₹${discount}`);
  const giftRow = buildRow('Gift Certificate', `-₹${gift}`);
  const taxRow = buildRow(`Tax`, `+₹${tax}`);
  const shippingRow = buildRow('Shipping', `+₹${shipping}`);

  function renderSummary() {
    const subtotal = getSubtotal();
    const total = subtotal - discount - gift - promoDiscount + tax + shipping;

    subtotalRow.querySelector('.order-summary-value').textContent = `₹${subtotal}`;
    totalRow.querySelector('.order-summary-value').textContent = `₹${Math.max(0, total)}`;

    // update promo row if applied
    const existingPromoRow = wrapper.querySelector('.order-summary-promo-applied');
    if (existingPromoRow) existingPromoRow.remove();
    if (promoDiscount > 0) {
      const promoRow = buildRow('Promo (WELCOME)', `-₹${promoDiscount}`, 'order-summary-promo-applied');
      wrapper.insertBefore(promoRow, divider);
    }
  }

  // assemble
  wrapper.append(title);
  wrapper.append(subtotalRow);
  wrapper.append(discountRow);
  wrapper.append(giftRow);
  wrapper.append(taxRow);
  wrapper.append(shippingRow);
  wrapper.append(promoSection);
  wrapper.append(divider);
  wrapper.append(totalRow);
  wrapper.append(checkoutBtn);
  wrapper.append(continueBtn);

  block.textContent = '';
  block.append(wrapper);

  // initial render
  renderSummary();

  // update when cart changes
  window.addEventListener('cart-updated', renderSummary);
}
