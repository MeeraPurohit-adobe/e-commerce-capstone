/**
 * Convert product name to URL slug
 * "Monstera Deliciosa" → "monstera-deliciosa"
 */
export function getProductSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Get product slug from current URL path
 * /pages/products/monstera-deliciosa → monstera-deliciosa
 */
export function getSlugFromURL() {
  const parts = window.location.pathname.split('/');
  const last = parts[parts.length - 1];
  // only return slug if we are on /pages/products/ path
  if (window.location.pathname.includes('/pages/products/')) {
    return last || '';
  }
  return '';
}

/**
 * Get product id from URL param
 * /products/product-detail-page?id=1 → 1
 */
export function getIdFromURL() {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('id') || '';
  } catch (e) {
    return '';
  }
}

/**
 * Fetch all products from sheet
 */
async function fetchAllProducts() {
  const resp = await fetch('/data/plants-listing.json?limit=1000');
  if (!resp.ok) throw new Error('Failed to fetch');
  const json = await resp.json();
  return json.data || [];
}

/**
 * Fetch product by slug
 * matches product name converted to slug
 */
export async function fetchProductBySlug(slug) {
  try {
    const products = await fetchAllProducts();
    return products.find((p) => getProductSlug(p.name) === slug) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch product by numeric id
 */
export async function fetchProductById(id) {
  try {
    const products = await fetchAllProducts();
    return products.find((p) => String(p.id) === String(id)) || null;
  } catch (e) {
    return null;
  }
}
