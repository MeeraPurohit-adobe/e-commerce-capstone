function loadCSS() {
  const cssPath = '/blocks/light-filter/light-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderLightFilter(container, filteredData, allData, onChange) {
  loadCSS();
  container.textContent = '';

  const allStores = [...new Set(allData.map((p) => p.store).filter(Boolean))].sort();
  const params = new URLSearchParams(window.location.search);
  const selected = params.get('lights') ? params.get('lights').split(',') : [];

  const wrapper = document.createElement('div');
  wrapper.classList.add('light-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Light';

  const btnRow = document.createElement('div');
  btnRow.classList.add('light-filter-buttons');

  allStores.forEach((store) => {
    const count = filteredData.filter((p) => p.store === store).length;

    const btn = document.createElement('button');
    btn.classList.add('light-filter-btn');
    btn.textContent = store;
    btn.dataset.value = store;
    if (selected.includes(store)) btn.classList.add('active');
    if (count === 0 && !selected.includes(store)) btn.classList.add('disabled');
    btn.disabled = count === 0 && !selected.includes(store);

    btn.addEventListener('click', () => {
      if (!btn.disabled) {
        btn.classList.toggle('active');
        onChange();
      }
    });
    btnRow.append(btn);
  });

  wrapper.append(title);
  wrapper.append(btnRow);
  container.append(wrapper);
}

export function getLightFilterValues(container) {
  return [...container.querySelectorAll('.light-filter-btn.active')].map((btn) => btn.dataset.value);
}

export function resetLightFilter(container) {
  container.querySelectorAll('.light-filter-btn').forEach((btn) => btn.classList.remove('active'));
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}
