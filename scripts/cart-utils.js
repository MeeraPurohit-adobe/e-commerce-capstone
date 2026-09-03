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
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const tryUpdate = () => {
    const cartIcon = document.querySelector('.nav-tools a[href="/cart/cart"]')
      || document.querySelector('.nav-tools a[aria-label="Cart"]')
      || document.querySelector('header a[href="/cart/cart"]')
      || document.querySelector('header a[aria-label="Cart"]');

    if (!cartIcon) return false;

    cartIcon.style.position = 'relative';
    cartIcon.style.display = 'inline-flex';

    let cartBadge = cartIcon.querySelector('.cart-badge');
    if (!cartBadge) {
      cartBadge = document.createElement('span');
      cartBadge.classList.add('cart-badge');
      cartIcon.append(cartBadge);
    }

    cartBadge.textContent = totalQty;
    cartBadge.style.display = totalQty > 0 ? 'flex' : 'none';
    return true;
  };

  // try immediately then keep retrying until header loads
  const attempts = [100, 300, 500, 800, 1000, 1500, 2000];
  attempts.forEach((delay) => setTimeout(tryUpdate, delay));
}



export function addToCart(product) {
  const cart = getCart();
  const quantity = product.quantity || 1;
  const existing = cart.find((item) => String(item.id) === String(product.id));

  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);

  // dispatch AFTER save
  window.dispatchEvent(new CustomEvent('cart-updated'));
}
// update on page load
document.addEventListener('DOMContentLoaded', updateCartIcon);
// also handle back/forward navigation
window.addEventListener('pageshow', updateCartIcon);
