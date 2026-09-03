function loadCSS() {
  const cssPath = '/blocks/category-filter/category-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getSelected() {
  const params = new URLSearchParams(window.location.search);
  return params.get('categories') ? params.get('categories').split(',') : [];
}

export function renderCategoryFilter(container, filteredData, allData, onChange) {
  loadCSS();
  container.textContent = '';

  // get unique categories from ALL data but show count from filtered
  const allCategories = [...new Set(allData.map((p) => p.categories).filter(Boolean))].sort();
  const selected = getSelected();

  const wrapper = document.createElement('div');
  wrapper.classList.add('category-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Category';

  const list = document.createElement('div');
  list.classList.add('category-filter-list');

  allCategories.forEach((cat) => {
    // count how many in filtered data
    const count = filteredData.filter((p) => p.categories === cat).length;

    const label = document.createElement('label');
    label.classList.add('category-filter-label');
    if (count === 0 && !selected.includes(cat)) label.classList.add('disabled');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    checkbox.classList.add('category-filter-checkbox');
    checkbox.checked = selected.includes(cat);
    checkbox.disabled = count === 0 && !selected.includes(cat);
    checkbox.addEventListener('change', () => onChange());

    const span = document.createElement('span');
    span.textContent = cat;

    const countSpan = document.createElement('span');
    countSpan.classList.add('filter-count');
    countSpan.textContent = `(${count})`;

    label.append(checkbox);
    label.append(span);
    label.append(countSpan);
    list.append(label);
  });

  wrapper.append(title);
  wrapper.append(list);
  container.append(wrapper);
}

export function getCategoryFilterValues(container) {
  return [...container.querySelectorAll('.category-filter-checkbox:checked')].map((cb) => cb.value);
}

export function resetCategoryFilter(container) {
  container.querySelectorAll('.category-filter-checkbox').forEach((cb) => { cb.checked = false; });
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}
