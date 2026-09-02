function loadSortCSS() {
  const cssPath = '/blocks/sort/sort.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getSortFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('sort') || 'featured-items';
}

async function fetchAllRecords(dataUrl) {
  // check sessionStorage first
  const cached = sessionStorage.getItem(`sort-data-${dataUrl}`);
  if (cached) return JSON.parse(cached);

  // fetch all records
  const resp = await fetch(`${dataUrl}?limit=1000`);
  if (!resp.ok) throw new Error('Failed to fetch');
  const json = await resp.json();
  const data = json.data || [];

  // cache in sessionStorage
  sessionStorage.setItem(`sort-data-${dataUrl}`, JSON.stringify(data));
  return data;
}

function sortData(data, sortValue) {
  const sorted = [...data];
  if (sortValue === 'price--low-to-high') {
    return sorted.sort((a, b) => parseInt(a.price.replace(/[^0-9]/g, ''), 10) - parseInt(b.price.replace(/[^0-9]/g, ''), 10));
  }
  if (sortValue === 'price--high-to-low') {
    return sorted.sort((a, b) => parseInt(b.price.replace(/[^0-9]/g, ''), 10) - parseInt(a.price.replace(/[^0-9]/g, ''), 10));
  }
  if (sortValue === 'top-rated') {
    return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  }
  return sorted;
}

export async function getSortedData(dataUrl) {
  const sortValue = getSortFromURL();
  const allData = await fetchAllRecords(dataUrl);
  return sortData(allData, sortValue);
}

export default function decorate(block) {
  loadSortCSS();

  // read options from block content
  const items = [...block.querySelectorAll(':scope > div > div > p')];
  if (!items.length) return;

  const label = items[0]?.textContent.trim();
  const options = items.slice(1).map((p) => p.textContent.trim());

  // build sort dropdown
  const wrapper = document.createElement('div');
  wrapper.classList.add('sort-wrapper');

  const sortLabel = document.createElement('label');
  sortLabel.textContent = label;
  sortLabel.setAttribute('for', 'sort-select');
  sortLabel.classList.add('sort-label');

  const sortSelect = document.createElement('select');
  sortSelect.id = 'sort-select';
  sortSelect.classList.add('sort-select');

  const currentSort = getSortFromURL();

  options.forEach((opt) => {
    const value = opt.toLowerCase().replace(/[: ]/g, '-');
    const option = document.createElement('option');
    option.value = value;
    option.textContent = opt;
    if (value === currentSort) option.selected = true;
    sortSelect.append(option);
  });

  // on change — update URL, clear cached sorted data, reload page
  sortSelect.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('sort', sortSelect.value);
    url.searchParams.set('page', '1');
    // clear cached data so sort re-fetches
    sessionStorage.removeItem('sort-data-/data/plants-listing.json');
    window.location.href = url.toString();
  });

  wrapper.append(sortLabel);
  wrapper.append(sortSelect);

  block.textContent = '';
  block.append(wrapper);
}
