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

  const topCol = rows[0].querySelector(':scope > div');

  // heading wrapper
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

  // ── MOBILE FILTER BUTTON + DRAWER ──
  const section = block.closest('.section');
  if (section) {
    const advanceFilter = section.querySelector('.advance-filter-wrapper');

    if (advanceFilter) {
      // create overlay
      const overlay = document.createElement('div');
      overlay.classList.add('plp-filter-overlay');
      document.body.append(overlay);

      // create drawer header
      const drawerHeader = document.createElement('div');
      drawerHeader.classList.add('plp-filter-drawer-header');

      const drawerTitle = document.createElement('h3');
      drawerTitle.classList.add('plp-filter-drawer-title');
      drawerTitle.textContent = 'Filters';

      const closeBtn = document.createElement('button');
      closeBtn.classList.add('plp-filter-close-btn');
      closeBtn.setAttribute('aria-label', 'Close filters');
      closeBtn.innerHTML = '✕';

      drawerHeader.append(drawerTitle);
      drawerHeader.append(closeBtn);

      // wrap existing filter content
      const drawerContent = document.createElement('div');
      drawerContent.classList.add('plp-filter-drawer-content');

      const innerWrapper = advanceFilter.querySelector('.advance-filter-wrapper');
      if (innerWrapper) {
        const resetBtn = innerWrapper.querySelector('.advance-filter-reset');

        const drawerFooter = document.createElement('div');
        drawerFooter.classList.add('plp-filter-drawer-footer');

        if (resetBtn) {
          drawerFooter.append(resetBtn);
        }

        drawerContent.append(innerWrapper);
        advanceFilter.textContent = '';
        advanceFilter.append(drawerHeader);
        advanceFilter.append(drawerContent);
        advanceFilter.append(drawerFooter);
      }

      // filter icon button
      const filterBtn = document.createElement('button');
      filterBtn.classList.add('plp-filter-btn');
      filterBtn.setAttribute('aria-label', 'Open filters');
      filterBtn.setAttribute('role', 'button');
      filterBtn.setAttribute('tabindex', '0');
      filterBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18M6 12h12M10 18h4"/>
        </svg>
        Filters
      `;

      const openDrawer = () => {
        advanceFilter.classList.add('filter-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      const closeDrawer = () => {
        advanceFilter.classList.remove('filter-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      };

      filterBtn.addEventListener('click', openDrawer);
      filterBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') openDrawer();
      });
      closeBtn.addEventListener('click', closeDrawer);
      overlay.addEventListener('click', closeDrawer);

      // auto close on filter change
      window.addEventListener('filters-changed', closeDrawer);

      // add filter button to heading row
      headingWrapper.append(filterBtn);
    }
  }

  // ── LOAD PAGE FUNCTION ──
  async function loadPage(page) {
    cardsSection.innerHTML = '<p class="product-listing-loading">Loading...</p>';

    try {
      // step 1 — get all sorted data
      const allData = await getSortedData(DATA_URL);

      // step 2 — apply filters
      const filters = getFiltersFromURL();
      const filteredData = applyFilters(allData, filters);

      // step 3 — update count beside Plants heading
      const h1 = headingWrapper.querySelector('h1');
      if (h1) {
        const existingCount = h1.querySelector('.product-count');
        if (existingCount) existingCount.remove();
        const countSpan = document.createElement('span');
        countSpan.classList.add('product-count');
        countSpan.textContent = `(${filteredData.length})`;
        h1.append(countSpan);
      }

      // step 4 — correct offset calculation
      const currentPage = parseInt(page, 10) || 1;
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const products = filteredData.slice(start, end);

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

        cardsSection.append(cardWrapper);
      });
    } catch (e) {
      cardsSection.innerHTML = '<p class="product-listing-error">Failed to load plants.</p>';
    }
  }

  // ── EVENT LISTENERS ──
  window.addEventListener('filters-changed', () => loadPage(getPageFromURL()));
  window.addEventListener('page-changed', () => loadPage(getPageFromURL()));
  window.addEventListener('popstate', () => loadPage(getPageFromURL()));

  // initial load
  loadPage(getPageFromURL());
}
