import { buildCard } from '../card/card.js';
import { getSortedData } from '../sort/sort.js';

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
  const topRow = rows[0];
  const topCol = topRow.querySelector(':scope > div');

  const headingRow = document.createElement('div');
  headingRow.classList.add('product-listing-heading-row');

  const heading = topCol?.querySelector('h1');
  if (heading) headingRow.append(heading);

  // filters - left
  const filtersSection = document.createElement('div');
  filtersSection.classList.add('product-listing-filters');
  filtersSection.innerHTML = '<p class="product-listing-filters-placeholder">Filters coming soon...</p>';

  // cards - right
  const cardsSection = document.createElement('div');
  cardsSection.classList.add('product-listing-cards');
  cardsSection.innerHTML = '<p class="product-listing-loading">Loading plants...</p>';

  // body
  const bodySection = document.createElement('div');
  bodySection.classList.add('product-listing-body');
  bodySection.append(filtersSection);
  bodySection.append(cardsSection);

  block.textContent = '';
  block.append(headingRow);
  block.append(bodySection);

  // load page from sorted data
  async function loadPage(page) {
    cardsSection.innerHTML = '<p class="product-listing-loading">Loading...</p>';

    try {
      // get all sorted records from sort.js
      const allData = await getSortedData(DATA_URL);
      const totalRecords = allData.length;
      // after calculating totalRecords, find h1 and update it
      const h1 = block.querySelector('h1');
      if (h1) {
        // remove existing count span if any
        const existingCount = h1.querySelector('.product-count');
        if (existingCount) existingCount.remove();

        // add new count span
        const countSpan = document.createElement('span');
        countSpan.classList.add('product-count');
        countSpan.textContent = `(${totalRecords})`;
        h1.append(countSpan);
      }
      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

      // slice for current page
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const products = allData.slice(start, end);

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

      // store total in sessionStorage for pagination block
      sessionStorage.setItem('total-records', totalRecords);

    } catch (e) {
      cardsSection.innerHTML = '<p class="product-listing-error">Failed to load plants.</p>';
    }
  }

  // listen for browser back/forward
  window.addEventListener('popstate', () => {
    loadPage(getPageFromURL());
  });

  // initial load
  loadPage(getPageFromURL());
}