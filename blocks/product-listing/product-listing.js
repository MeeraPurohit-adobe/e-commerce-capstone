import { buildCard } from '../card/card.js';
import { getSortedData } from '../sort/sort.js';
import { applyFilters, getFiltersFromURL } from '../advance-filter/advance-filter.js';

const PAGE_SIZE = 10;
const DATA_URL = '/data/plants-listing.json';

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page') || '1', 10);
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // row 1 = heading
  const topCol = rows[0].querySelector(':scope > div');

  const headingWrapper = document.createElement('div');
  headingWrapper.classList.add('product-listing-heading-row');

  const heading = topCol?.querySelector('h1');
  if (heading) headingWrapper.append(heading);

  // cards section
  const cardsSection = document.createElement('div');
  cardsSection.classList.add('product-listing-cards');
  cardsSection.innerHTML = '<p class="product-listing-loading">Loading plants...</p>';

  block.textContent = '';
  block.append(headingWrapper);
  block.append(cardsSection);

  async function loadPage(page) {
    cardsSection.innerHTML = '<p class="product-listing-loading">Loading...</p>';

    try {
      // step 1 — get all sorted data
      const allData = await getSortedData(DATA_URL);

      // step 2 — apply filters from URL
      const filters = getFiltersFromURL();
      const filteredData = applyFilters(allData, filters);

      // step 3 — update count in heading
      const h1 = headingWrapper.querySelector('h1');
      if (h1) {
        const existingCount = h1.querySelector('.product-count');
        if (existingCount) existingCount.remove();
        const countSpan = document.createElement('span');
        countSpan.classList.add('product-count');
        countSpan.textContent = `(${filteredData.length})`;
        h1.append(countSpan);
      }

      // step 4 — paginate
      const start = (page - 1) * PAGE_SIZE;
      const products = filteredData.slice(start, start + PAGE_SIZE);

      // store total for pagination block
      sessionStorage.setItem('total-records', filteredData.length);

      cardsSection.textContent = '';

      if (!products.length) {
        cardsSection.innerHTML = '<p class="product-listing-error">No plants found matching your filters.</p>';
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

  // listen for filter and pagination changes
  window.addEventListener('filters-changed', () => loadPage(getPageFromURL()));
  window.addEventListener('popstate', () => loadPage(getPageFromURL()));

  // initial load
  loadPage(getPageFromURL());
}
