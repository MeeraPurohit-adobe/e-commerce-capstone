export function getWishlist() {
  try {
    return JSON.parse(sessionStorage.getItem('wishlist') || '[]');
  } catch (e) {
    return [];
  }
}

export function saveWishlist(wishlist) {
  sessionStorage.setItem('wishlist', JSON.stringify(wishlist));
}

export function isWishlisted(productId) {
  const wishlist = getWishlist();
  return wishlist.some((item) => String(item.id) === String(productId));
}

export function toggleWishlist(product) {
  const wishlist = getWishlist();
  const exists = wishlist.some((item) => String(item.id) === String(product.id));

  if (exists) {
    // remove from wishlist
    const updated = wishlist.filter((item) => String(item.id) !== String(product.id));
    saveWishlist(updated);
  } else {
    // add whole product object to wishlist
    wishlist.push({ ...product });
    saveWishlist(wishlist);
  }

  // dispatch event for header to update count
  window.dispatchEvent(new CustomEvent('wishlist-updated'));

  return !exists;
}

export function updateWishlistIcon() {
  try {
    const wishlist = getWishlist();
    const total = wishlist.length;

    const wishlistIcon = document.querySelector('.icon-heart');
    if (!wishlistIcon) return;

    wishlistIcon.style.position = 'relative';
    wishlistIcon.style.display = 'inline-flex';

    let badge = wishlistIcon.querySelector('.wishlist-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.classList.add('wishlist-badge');
      wishlistIcon.append(badge);
    }

    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  } catch (e) {
    // fail silently
  }
}

// update on page load
function tryUpdateWishlistIcon() {
  const icon = document.querySelector('.icon-heart');
  if (icon) {
    updateWishlistIcon();
  } else {
    setTimeout(updateWishlistIcon, 500);
    setTimeout(updateWishlistIcon, 1000);
    setTimeout(updateWishlistIcon, 2000);
  }
}

document.addEventListener('DOMContentLoaded', tryUpdateWishlistIcon);
window.addEventListener('pageshow', tryUpdateWishlistIcon);