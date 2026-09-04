export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header (heading + shop now button)
  const headerRow = rows[0];
  const headerCols = [...headerRow.querySelectorAll(':scope > div')];

  const header = document.createElement('div');
  header.classList.add('categories-header');

  // heading - left side
  const headingWrapper = document.createElement('div');
  headingWrapper.classList.add('categories-heading');
  if (headerCols[0]) headingWrapper.innerHTML = headerCols[0].innerHTML;

  // shop now button - right side
  const btnWrapper = document.createElement('div');
  btnWrapper.classList.add('categories-btn');
  if (headerCols[1]) {
    const btn = headerCols[1].querySelector('a');
    if (btn) {
      btn.classList.add('categories-shop-btn');
      btnWrapper.append(btn);
    }
  }

  header.append(headingWrapper);
  header.append(btnWrapper);

  // scrollable track
  const track = document.createElement('div');
  track.classList.add('categories-track');

  // rows 2+ = category cards
  rows.slice(1).forEach((row) => {
    const card = document.createElement('div');
    card.classList.add('categories-card');

    const cols = [...row.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];

    if (mediaCol) {
      const paras = mediaCol.querySelectorAll('p');
      const img = mediaCol.querySelector('img');

      // image or emoji placeholder
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('categories-img-wrapper');

      if (img) {
        imgWrapper.append(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.classList.add('categories-placeholder');
        placeholder.textContent = paras[0]?.textContent || '';
        imgWrapper.append(placeholder);
      }

      // label - last paragraph
      const label = document.createElement('p');
      label.classList.add('categories-label');
      const categoryName = paras[paras.length - 1]?.textContent.trim() || '';
      label.textContent = categoryName;

      card.append(imgWrapper);
      card.append(label);

      // click → navigate to product listing with category filter
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const url = new URL('/products/product-listing-page', window.location.origin);
        url.searchParams.set('categories', categoryName);
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
      });
    }

    track.append(card);
  });

  block.textContent = '';
  block.append(header);
  block.append(track);
}
