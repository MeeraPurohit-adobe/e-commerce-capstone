import { buildCard } from '../card/card.js';

function loadCSS() {
  const cssPath = '/blocks/category-listing/category-listing.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export default async function decorate(block) {
  loadCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // read category name from h1
  const h1 = rows[0].querySelector('h1');
  const categoryName = h1?.textContent.trim() || '';

  const wrapper = document.createElement('div');
  wrapper.classList.add('category-listing-wrapper');

  // heading row
  const headingRow = document.createElement('div');
  headingRow.classList.add('category-listing-heading-row');

  const heading = document.createElement('h1');
  heading.classList.add('category-listing-heading');
  heading.textContent = categoryName;

  const countSpan = document.createElement('span');
  countSpan.classList.add('category-listing-count');

  headingRow.append(heading);
  headingRow.append(countSpan);

  // cards grid
  const grid = document.createElement('div');
  grid.classList.add('category-listing-grid');
  grid.innerHTML = '<p class="category-listing-loading">Loading products...</p>';

  wrapper.append(headingRow);
  wrapper.append(grid);

  block.textContent = '';
  block.append(wrapper);

  try {
    // fetch all products from sheet
    const resp = await fetch('/data/plants-listing.json?limit=1000');
    if (!resp.ok) throw new Error('Failed to fetch');
    const json = await resp.json();
    const allProducts = json.data || [];

    // filter by categories column matching h1 text
    const filtered = allProducts.filter((p) => p.categories
      && p.categories.toLowerCase() === categoryName.toLowerCase());

    // update count
    countSpan.textContent = `(${filtered.length})`;

    grid.textContent = '';

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="category-listing-empty">
          <p class="category-listing-empty-icon">🌿</p>
          <p class="category-listing-empty-title">No products found in ${categoryName}</p>
          <p class="category-listing-empty-text">Check back later for new arrivals.</p>
          <a href="/products/product-listing-page" class="category-listing-empty-btn">Browse All Products</a>
        </div>
      `;
      return;
    }

    // render cards using reusable buildCard
    filtered.forEach((product) => {
      const card = buildCard(product);
      grid.append(card);
    });

  } catch (e) {
    grid.innerHTML = '<p class="category-listing-error">Failed to load products.</p>';
  }
}