function loadCSS() {
  const cssPath = '/blocks/size-filter/size-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderSizeFilter(container, allData, onChange) {
  loadCSS();
  container.textContent = '';

  // check which sizes exist in data
  const sizes = [];
  if (allData.some((p) => p['size-small'] === 'Yes')) sizes.push({ label: 'Small', key: 'size-small' });
  if (allData.some((p) => p['size-medium'] === 'Yes')) sizes.push({ label: 'Medium', key: 'size-medium' });
  if (allData.some((p) => p['size-large'] === 'Yes')) sizes.push({ label: 'Large', key: 'size-large' });

  const params = new URLSearchParams(window.location.search);
  const selected = params.get('sizes') ? params.get('sizes').split(',') : [];

  const wrapper = document.createElement('div');
  wrapper.classList.add('size-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Size';

  const btnRow = document.createElement('div');
  btnRow.classList.add('size-filter-buttons');

  sizes.forEach(({ label, key }) => {
    const btn = document.createElement('button');
    btn.classList.add('size-filter-btn');
    btn.textContent = label;
    btn.dataset.value = key;
    if (selected.includes(key)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      onChange();
    });
    btnRow.append(btn);
  });

  wrapper.append(title);
  wrapper.append(btnRow);
  container.append(wrapper);
}

export function getSizeFilterValues(container) {
  return [...container.querySelectorAll('.size-filter-btn.active')].map((btn) => btn.dataset.value);
}

export function resetSizeFilter(container) {
  container.querySelectorAll('.size-filter-btn').forEach((btn) => btn.classList.remove('active'));
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}