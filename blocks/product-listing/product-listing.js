import { buildCard } from '../card/card.js';

const PAGE_SIZE = 10;

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page') || '1', 10);
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // row 1 = heading + sort dropdown
  const topRow = rows[0];
  const topCol = topRow.querySelector(':scope > div');

  const headingRow = document.createElement('div');
  headingRow.classList.add('product-listing-heading-row');

  const heading = topCol?.querySelector('h1');
  if (heading) headingRow.append(heading);

  // sort dropdown
  const sortWrapper = document.createElement('div');
  sortWrapper.classList.add('product-listing-sort');

  const sortLabel = document.createElement('label');
  sortLabel.textContent = 'Sort by: ';
  sortLabel.setAttribute('for', 'sort-select');

  const sortSelect = document.createElement('select');
  sortSelect.id = 'sort-select';
  sortSelect.classList.add('product-listing-sort-select');

  ['Featured Items', 'Price: Low to High', 'Price: High to Low', 'Top Rated'].forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.toLowerCase().replace(/[: ]/g, '-');
    option.textContent = opt;
    sortSelect.append(option);
  });

  sortWrapper.append(sortLabel);
  sortWrapper.append(sortSelect);
  headingRow.append(sortWrapper);

  // filters - left
  const filtersSection = document.createElement('div');
  filtersSection.classList.add('product-listing-filters');
  filtersSection.innerHTML = '<p class="product-listing-filters-placeholder">Filters coming soon...</p>';

  // cards - right
  const cardsSection = document.createElement('div');
  cardsSection.classList.add('product-listing-cards');
  cardsSection.innerHTML = '<p class="product-listing-loading">Loading plants...</p>';

  // body layout
  const bodySection = document.createElement('div');
  bodySection.classList.add('product-listing-body');
  bodySection.append(filtersSection);
  bodySection.append(cardsSection);

  block.textContent = '';
  block.append(headingRow);
  block.append(bodySection);

  // state
  let sortValue = 'featured-items';

  // fetch page using offset + limit
  async function fetchPage(page) {
    const offset = (page - 1) * PAGE_SIZE;
    const url = `/data/plants-listing.json?offset=${offset}&limit=${PAGE_SIZE}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch');
    return resp.json();
  }

  // render cards for current page
  async function loadPage(page) {
    cardsSection.innerHTML = '<p class="product-listing-loading">Loading...</p>';

    try {
      const json = await fetchPage(page);
      let products = json.data || [];

      // client side sort
      if (sortValue === 'price--low-to-high') {
        products = products.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, ''), 10) - parseInt(b.price.replace(/[^0-9]/g, ''), 10));
      } else if (sortValue === 'price--high-to-low') {
        products = products.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, ''), 10) - parseInt(a.price.replace(/[^0-9]/g, ''), 10));
      } else if (sortValue === 'top-rated') {
        products = products.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      }

      cardsSection.textContent = '';

      if (!products.length) {
        cardsSection.innerHTML = '<p class="product-listing-error">No plants found.</p>';
        return;
      }

      products.forEach((plant) => {
        const cardWrapper = document.createElement('div');
        cardWrapper.classList.add('product-listing-card-wrapper');

        const card = buildCard(plant);
        cardWrapper.append(card);

        // compare checkbox
        const compareWrapper = document.createElement('div');
        compareWrapper.classList.add('product-listing-compare');

        const compareCheckbox = document.createElement('input');
        compareCheckbox.type = 'checkbox';
        compareCheckbox.id = `compare-${plant.name.replace(/ /g, '-').toLowerCase()}`;
        compareCheckbox.classList.add('product-listing-compare-checkbox');

        const compareLabel = document.createElement('label');
        compareLabel.htmlFor = compareCheckbox.id;
        compareLabel.textContent = 'Compare';
        compareLabel.classList.add('product-listing-compare-label');

        compareWrapper.append(compareCheckbox);
        compareWrapper.append(compareLabel);
        cardWrapper.append(compareWrapper);

        cardsSection.append(cardWrapper);
      });

    } catch (e) {
      cardsSection.innerHTML = '<p class="product-listing-error">Failed to load plants.</p>';
    }
  }

  // sort change handler
  sortSelect.addEventListener('change', () => {
    sortValue = sortSelect.value;
    // reset to page 1 on sort change
    const url = new URL(window.location.href);
    url.searchParams.set('page', '1');
    window.history.pushState({}, '', url);
    loadPage(1);
  });

  // listen for URL changes (browser back/forward)
  window.addEventListener('popstate', () => {
    loadPage(getPageFromURL());
  });

  // initial load from URL
  loadPage(getPageFromURL());
}