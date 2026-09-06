/* export default function decorate(block) {
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

function getCategoryEmoji(name) {
  const emojis = {
    plants: '🌿',
    pots: '🪴',
    bundles: '🎁',
    accessories: '🧰',
    fertilizers: '🌱',
    seeds: '🌾',
    'garden-tools': '🛠️',
    'pest-control': '🐛',
    soils: '🪱',
  };
  return emojis[name.toLowerCase()] || '🌿';
}

async function getCategoriesFromQueryIndex() {
  try {
    const resp = await fetch('/query-index.json');
    if (!resp.ok) throw new Error('Failed to fetch query index');
    const json = await resp.json();
    const allPages = json.data || [];
    return allPages.filter((page) => page.path && page.path.startsWith('/category/'));
  } catch (e) {
    return [];
  }
}

function getStaticImageMap(rows) {
  // build a map of category name → image src from static fragment rows
  const imageMap = {};
  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];
    if (!mediaCol) return;

    const paras = mediaCol.querySelectorAll('p');
    const img = mediaCol.querySelector('img');
    const categoryName = paras[paras.length - 1]?.textContent.trim() || '';
    const urlKey = categoryName.toLowerCase().replace(/ /g, '-');

    if (categoryName && img?.src) {
      imageMap[urlKey] = {
        src: img.src,
        alt: img.alt || categoryName,
      };
    }
  });
  return imageMap;
}

function buildCategoryCard(categoryName, imgSrc, imgAlt, path) {
  const card = document.createElement('div');
  card.classList.add('categories-card');
  card.style.cursor = 'pointer';

  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('categories-img-wrapper');

  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = imgAlt || categoryName;
    img.loading = 'lazy';
    imgWrapper.append(img);
  } else {
    // fallback to emoji only if no image at all
    const placeholder = document.createElement('div');
    placeholder.classList.add('categories-placeholder');
    const urlKey = categoryName.toLowerCase().replace(/ /g, '-');
    placeholder.textContent = getCategoryEmoji(urlKey);
    imgWrapper.append(placeholder);
  }

  const label = document.createElement('p');
  label.classList.add('categories-label');
  label.textContent = categoryName;

  card.append(imgWrapper);
  card.append(label);

  card.addEventListener('click', () => {
    window.location.href = path || `/category/${categoryName.toLowerCase().replace(/ /g, '-')}`;
  });

  return card;
}

function renderStaticCategories(rows, track) {
  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];
    if (!mediaCol) return;

    const paras = mediaCol.querySelectorAll('p');
    const img = mediaCol.querySelector('img');
    const categoryName = paras[paras.length - 1]?.textContent.trim() || '';
    const imgSrc = img?.src || '';
    const imgAlt = img?.alt || categoryName;

    const card = buildCategoryCard(categoryName, imgSrc, imgAlt, null);
    track.append(card);
  });
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header
  const headerRow = rows[0];
  const headerCols = [...headerRow.querySelectorAll(':scope > div')];

  const header = document.createElement('div');
  header.classList.add('categories-header');

  const headingWrapper = document.createElement('div');
  headingWrapper.classList.add('categories-heading');
  if (headerCols[0]) headingWrapper.innerHTML = headerCols[0].innerHTML;

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

  const track = document.createElement('div');
  track.classList.add('categories-track');

  block.textContent = '';
  block.append(header);
  block.append(track);

  // build image map from static fragment rows FIRST
  const staticRows = rows.slice(1);
  const imageMap = getStaticImageMap(staticRows);

  // ── TRY QUERY INDEX FIRST ──
  const queryCategories = await getCategoriesFromQueryIndex();

  if (queryCategories.length) {
    // ✅ query index available
    queryCategories.forEach((cat) => {
      const urlName = cat.path.split('/').pop();
      const categoryName = urlName.charAt(0).toUpperCase()
        + urlName.slice(1).replace(/-/g, ' ');

      // use image from query index OR fall back to static fragment image
      const staticImg = imageMap[urlName];
      const imgSrc = cat.image || staticImg?.src || '';
      const imgAlt = staticImg?.alt || categoryName;

      const card = buildCategoryCard(categoryName, imgSrc, imgAlt, cat.path);
      track.append(card);
    });
  } else {
    // ❌ query index not available — use static content with images
    renderStaticCategories(staticRows, track);
  }
}
