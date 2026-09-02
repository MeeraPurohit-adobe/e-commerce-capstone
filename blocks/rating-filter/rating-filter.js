function loadCSS() {
  const cssPath = '/blocks/rating-filter/rating-filter.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderRatingFilter(container, onChange) {
  loadCSS();
  container.textContent = '';

  const params = new URLSearchParams(window.location.search);
  const selected = params.get('ratings') ? params.get('ratings').split(',').map(Number) : [];

  const wrapper = document.createElement('div');
  wrapper.classList.add('rating-filter-wrapper');

  const title = document.createElement('h4');
  title.classList.add('filter-section-title');
  title.textContent = 'Rating';

  const list = document.createElement('div');
  list.classList.add('rating-filter-list');

  // show 5 down to 1
  [5, 4, 3, 2, 1].forEach((rating) => {
    const label = document.createElement('label');
    label.classList.add('rating-filter-label');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = rating;
    checkbox.classList.add('rating-filter-checkbox');
    checkbox.checked = selected.includes(rating);
    checkbox.addEventListener('change', () => onChange());

    const starsWrapper = document.createElement('span');
    starsWrapper.classList.add('rating-filter-stars');

    for (let i = 1; i <= 5; i += 1) {
      const star = document.createElement('span');
      star.classList.add('rating-star');
      star.textContent = i <= rating ? '★' : '☆';
      if (i <= rating) star.classList.add('filled');
      starsWrapper.append(star);
    }

    const text = document.createElement('span');
    text.classList.add('rating-filter-text');
    text.textContent = rating < 5 ? '& Up' : 'Only';

    label.append(checkbox);
    label.append(starsWrapper);
    label.append(text);
    list.append(label);
  });

  wrapper.append(title);
  wrapper.append(list);
  container.append(wrapper);
}

export function getRatingFilterValues(container) {
  return [...container.querySelectorAll('.rating-filter-checkbox:checked')].map((cb) => parseInt(cb.value, 10));
}

export function resetRatingFilter(container) {
  container.querySelectorAll('.rating-filter-checkbox').forEach((cb) => { cb.checked = false; });
}

export default function decorate(block) {
  loadCSS();
  block.textContent = '';
}
