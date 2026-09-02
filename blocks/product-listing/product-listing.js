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
  const headingRow = rows[0];
  const headingCol = headingRow.querySelector(':scope > div');

  const heading = headingCol?.querySelector('h1');

  const headingWrapper = document.createElement('div');
  headingWrapper.classList.add('product-listing-heading-row');
  if (heading) headingWrapper.append(heading);

  // row 2 = left (advance-filter) + right (cards)
  const bodyRow = rows[1];
  const bodyCols = [...(bodyRow?.querySelectorAll(':scope > div') || [])];

  // left column — advance-filter
  const leftCol = document.createElement('div');
  leftCol.classList.add('product-listing-left');

  // move advance-filter block into left col
  const advanceFilter = bodyCols[0]?.querySelector('.advance-filter');
  if (advanceFilter) leftCol.append(advanceFilter);

  // right column — cards
  const rightCol = document.createElement('div');
  rightCol.classList.add('product-listing-right');

  const cardsSection = document.createElement('div');
  cardsSection.classList.add('product-listing-cards');
  cardsSection.innerHTML = '<p class="product-listing-loading">Loading plants...</p>';
  rightCol.append(cardsSection);

  // build layout
  const bodyWrapper = document.createElement('div');
  bodyWrapper.classList.add('product-listing-body');
  bodyWrapper.append(leftCol);
  bodyWrapper.append(rightCol);

  block.textContent = '';
  block.append(headingWrapper);
  block.append(bodyWrapper);

  async function loadPage(page) {
    cardsSection.innerHTML = '<p class="product-listing-loading">Loading...</p>';

    try {
      const allData = await getSortedData(DATA_URL);
      const filters = getFiltersFromURL();
      const filteredData = applyFilters(allData, filters);

      // update count in heading
      const h1 = headingWrapper.querySelector('h1');
      if (h1) {
        const existingCount = h1.querySelector('.product-count');
        if (existingCount) existingCount.remove();
        const countSpan = document.createElement('span');
        countSpan.classList.add('product-count');
        countSpan.textContent = `(${filteredData.length})`;
        h1.append(countSpan);
      }

      const start = (page - 1) * PAGE_SIZE;
      const products = filteredData.slice(start, start + PAGE_SIZE);

      // store total for pagination
      sessionStorage.setItem('total-records', filteredData.length);

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

  window.addEventListener('filters-changed', () => loadPage(getPageFromURL()));
  window.addEventListener('popstate', () => loadPage(getPageFromURL()));

  loadPage(getPageFromURL());
}
