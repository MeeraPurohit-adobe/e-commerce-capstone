import decorateCartItems from '../cart-items/cart-items.js';
import decorateOrderSummary from '../order-summary/order-summary.js';

function loadCSS() {
  const cssPath = '/blocks/account/account.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');
  } catch (e) {
    return null;
  }
}

async function loadFragment(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) throw new Error(`Failed to fetch ${path}`);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.querySelector('main') || doc.body;
}

function manipulateCartItems(container) {
  // remove cart header label row
  const headerRow = container.querySelector('.cart-items-header');
  if (headerRow) headerRow.remove();

  // for each cart item row
  container.querySelectorAll('.cart-item-row').forEach((row) => {
    // remove delete button
    const deleteBtn = row.querySelector('.cart-item-delete');
    if (deleteBtn) deleteBtn.remove();

    // replace quantity input with simple label
    const qtyWrapper = row.querySelector('.cart-item-qty');
    const info = row.querySelector('.cart-item-info');

    if (qtyWrapper && info) {
      // get current quantity value
      const qtyInput = qtyWrapper.querySelector('.cart-qty-input');
      const qty = qtyInput ? qtyInput.value : '1';

      // create simple quantity label
      const qtyLabel = document.createElement('p');
      qtyLabel.classList.add('account-item-qty');
      qtyLabel.textContent = `Quantity: ${qty}`;

      // replace qty wrapper with label inside info
      qtyWrapper.remove();
      info.append(qtyLabel);
    }
  });
}

function manipulateOrderSummary(container) {
  // remove proceed to checkout button
  const checkoutBtn = container.querySelector('.order-summary-checkout-btn');
  if (checkoutBtn) checkoutBtn.remove();

  // remove continue shopping button
  const continueBtn = container.querySelector('.order-summary-continue-btn');
  if (continueBtn) continueBtn.remove();
}

export default async function decorate(block) {
  loadCSS();

  // check if user is logged in
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = '/404';
    return;
  }

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // heading row
  const headingRow = rows[0];
  const heading = headingRow.querySelector('h1');

  // build wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('account-wrapper');

  // welcome message
  const welcome = document.createElement('div');
  welcome.classList.add('account-welcome');
  welcome.innerHTML = `
    <h1>${heading?.textContent || 'My Orders'}</h1>
    <p>Welcome back, <strong>${user.first_name} ${user.last_name}</strong>!</p>
  `;

  // two column layout
  const layout = document.createElement('div');
  layout.classList.add('account-layout');

  // left column - cart items
  const leftCol = document.createElement('div');
  leftCol.classList.add('account-left');
  leftCol.innerHTML = '<p class="account-loading">Loading orders...</p>';

  // right column - order summary
  const rightCol = document.createElement('div');
  rightCol.classList.add('account-right');
  rightCol.innerHTML = '<p class="account-loading">Loading summary...</p>';

  layout.append(leftCol);
  layout.append(rightCol);
  wrapper.append(welcome);
  wrapper.append(layout);

  block.textContent = '';
  block.append(wrapper);

  // load cart-items fragment
  try {
    const cartFragment = await loadFragment('/fragments/cart-items');
    leftCol.textContent = '';
    while (cartFragment.firstElementChild) {
      leftCol.append(cartFragment.firstElementChild);
    }

    // decorate cart-items block
    const cartBlock = leftCol.querySelector('.cart-items');
    if (cartBlock) {
      decorateCartItems(cartBlock);

      // wait for decoration to complete then manipulate
      setTimeout(() => {
        manipulateCartItems(leftCol);
      }, 300);
    }
  } catch (e) {
    leftCol.innerHTML = '<p class="account-error">Failed to load orders.</p>';
  }

  // load order-summary fragment
  try {
    const summaryFragment = await loadFragment('/fragments/order-summary');
    rightCol.textContent = '';
    while (summaryFragment.firstElementChild) {
      rightCol.append(summaryFragment.firstElementChild);
    }

    // decorate order-summary block
    const summaryBlock = rightCol.querySelector('.order-summary');
    if (summaryBlock) {
      decorateOrderSummary(summaryBlock);

      // wait for decoration then manipulate
      setTimeout(() => {
        manipulateOrderSummary(rightCol);
      }, 300);
    }
  } catch (e) {
    rightCol.innerHTML = '<p class="account-error">Failed to load summary.</p>';
  }
}