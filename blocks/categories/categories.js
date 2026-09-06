/*export default function decorate(block) {
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

      // ── CLICK → navigate to category page ──
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const urlName = categoryName.toLowerCase().replace(/ /g, '-');
        window.location.href = `/category/${urlName}`;
      });
    }

    track.append(card);
  });

  block.textContent = '';
  block.append(header);
  block.append(track);
}
*/
async function getCategoriesFromQueryIndex() {
  try {
    const resp = await fetch('/query-index.json');
    if (!resp.ok) throw new Error('Failed');
    const json = await resp.json();
    const allPages = json.data || [];
    // filter only category pages
    return allPages.filter((page) => page.path.startsWith('/category/'));
  } catch (e) {
    return [];
  }
}

export default async function decorate(block) {
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

  try {
    // ── FETCH FROM QUERY INDEX ──
    const categories = await getCategoriesFromQueryIndex();

    if (categories.length) {
      track.textContent = '';
      categories.forEach((cat) => {
        const card = document.createElement('div');
        card.classList.add('categories-card');
        card.style.cursor = 'pointer';

        // extract name from path: /category/plants → Plants
        const urlName = cat.path.split('/').pop();
        const categoryName = urlName.charAt(0).toUpperCase()
          + urlName.slice(1).replace(/-/g, ' ');

        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('categories-img-wrapper');

        if (cat.image) {
          const img = document.createElement('img');
          img.src = cat.image;
          img.alt = categoryName;
          img.loading = 'lazy';
          imgWrapper.append(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.classList.add('categories-placeholder');
          placeholder.textContent = getCategoryEmoji(urlName);
          imgWrapper.append(placeholder);
        }

        const label = document.createElement('p');
        label.classList.add('categories-label');
        label.textContent = categoryName;

        card.append(imgWrapper);
        card.append(label);

        card.addEventListener('click', () => {
          window.location.href = cat.path;
        });

        track.append(card);
      });
    } else {
      // fallback to static content
      renderStaticCategories(rows.slice(1), track);
    }
  } catch (e) {
    renderStaticCategories(rows.slice(1), track);
  }
}