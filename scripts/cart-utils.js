export function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem('cart') || '[]');
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

export function updateCartIcon() {
  try {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');

    const cartIcon = document.querySelector('.icon-cart');
    if (!cartIcon) return;

    cartIcon.style.position = 'relative';
    cartIcon.style.display = 'inline-flex';

    let badge = cartIcon.querySelector('.cart-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.classList.add('cart-badge');
      cartIcon.append(badge);
    }

    if (loggedInUser) {
      badge.style.display = 'none';
    } else {
      badge.textContent = totalQty;
      badge.style.display = totalQty > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    // fail silently
  }
}

export function addToCart(product) {
  const cart = getCart();
  const quantity = product.quantity || 1;
  const existing = cart.find((item) => String(item.id) === String(product.id));

  if (existing) {
    // replace quantity with new selected quantity
    existing.quantity = quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);

  // dispatch cart-updated so header updates badge
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

// retry until icon-cart is found in DOM
function tryUpdateCartIcon() {
  const cartIcon = document.querySelector('.icon-cart');
  if (cartIcon) {
    updateCartIcon();
  } else {
    setTimeout(updateCartIcon, 500);
    setTimeout(updateCartIcon, 1000);
    setTimeout(updateCartIcon, 2000);
  }
}

document.addEventListener('DOMContentLoaded', tryUpdateCartIcon);
window.addEventListener('pageshow', tryUpdateCartIcon);
