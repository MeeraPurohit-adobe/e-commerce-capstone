function loadCSS() {
  const cssPath = '/blocks/features-filter/features-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderFeaturesFilter(container, filteredData, allData, onChange) {
  loadCSS();
  container.textContent = '';

  const allTypes = [...new Set(allData.map((p) => p.type).filter(Boolean))].sort();
  const params = new URLSearchParams(window.location.search);
  const selected = params.get('features') ? params.get('features').split(',') : [];

  const wrapper = document.createElement('div');
  wrapper.classList.add('features-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Features';

  const btnRow = document.createElement('div');
  btnRow.classList.add('features-filter-buttons');

  allTypes.forEach((type) => {
    const count = filteredData.filter((p) => p.type === type).length;

    const btn = document.createElement('button');
    btn.classList.add('features-filter-btn');
    btn.textContent = type;
    btn.dataset.value = type;
    if (selected.includes(type)) btn.classList.add('active');
    if (count === 0 && !selected.includes(type)) btn.classList.add('disabled');
    btn.disabled = count === 0 && !selected.includes(type);

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

export function getFeaturesFilterValues(container) {
  return [...container.querySelectorAll('.features-filter-btn.active')].map((btn) => btn.dataset.value);
}

export function resetFeaturesFilter(container) {
  container.querySelectorAll('.features-filter-btn').forEach((btn) => btn.classList.remove('active'));
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}
