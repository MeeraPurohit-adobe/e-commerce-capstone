function loadCSS() {
  const cssPath = '/blocks/price-filter/price-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderPriceFilter(container, allData, onChange) {
  loadCSS();
  container.textContent = '';

  // get min and max price from data
  const prices = allData.map((p) => parseInt(p.price.replace(/[^0-9]/g, ''), 10)).filter(Boolean);
  const dataMin = Math.min(...prices);
  const dataMax = Math.max(...prices);

  const params = new URLSearchParams(window.location.search);
  const selectedMin = parseInt(params.get('priceMin') || dataMin, 10);
  const selectedMax = parseInt(params.get('priceMax') || dataMax, 10);

  const wrapper = document.createElement('div');
  wrapper.classList.add('price-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Price';

  // input row
  const inputRow = document.createElement('div');
  inputRow.classList.add('price-filter-input-row');

  const minInput = document.createElement('input');
  minInput.type = 'number';
  minInput.classList.add('price-filter-input');
  minInput.placeholder = `Min (₹${dataMin})`;
  minInput.value = selectedMin;
  minInput.min = dataMin;
  minInput.max = dataMax;

  const separator = document.createElement('span');
  separator.classList.add('price-filter-separator');
  separator.textContent = '—';

  const maxInput = document.createElement('input');
  maxInput.type = 'number';
  maxInput.classList.add('price-filter-input');
  maxInput.placeholder = `Max (₹${dataMax})`;
  maxInput.value = selectedMax;
  maxInput.min = dataMin;
  maxInput.max = dataMax;

  const applyBtn = document.createElement('button');
  applyBtn.classList.add('price-filter-apply');
  applyBtn.setAttribute('aria-label', 'Apply price filter');
  applyBtn.textContent = '→';
  applyBtn.addEventListener('click', () => onChange());

  // also trigger on enter key
  [minInput, maxInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') onChange();
    });
  });

  inputRow.append(minInput);
  inputRow.append(separator);
  inputRow.append(maxInput);
  inputRow.append(applyBtn);

  wrapper.append(title);
  wrapper.append(inputRow);
  container.append(wrapper);
}

export function getPriceFilterValues(container) {
  const minInput = container.querySelector('.price-filter-input:first-child');
  const maxInput = container.querySelector('.price-filter-input:last-of-type');
  return {
    min: minInput ? parseInt(minInput.value, 10) : 0,
    max: maxInput ? parseInt(maxInput.value, 10) : 99999,
  };
}

export function resetPriceFilter(container) {
  const inputs = container.querySelectorAll('.price-filter-input');
  inputs.forEach((input) => { input.value = ''; });
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}
