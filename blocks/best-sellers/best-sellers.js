function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push('<span class="star full">★</span>');
    } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
      stars.push('<span class="star half">★</span>');
    } else {
      stars.push('<span class="star empty">☆</span>');
    }
  }
  return stars.join('');
}

function renderColors(colorsStr) {
  return colorsStr.split(',').map((c) => {
    const color = c.trim();
    return `<button class="best-sellers-color-dot" style="background:${color.toLowerCase()}" title="${color}" aria-label="${color}"></button>`;
  }).join('');
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header section
  const headerRow = rows[0];
  const headerCols = [...headerRow.querySelectorAll(':scope > div')];

  const wrapper = document.createElement('div');
  wrapper.classList.add('best-sellers-wrapper');

  // left text section
  const leftSection = document.createElement('div');
  leftSection.classList.add('best-sellers-left');
  if (headerCols[0]) leftSection.innerHTML = headerCols[0].innerHTML;
  const cta = leftSection.querySelector('a');
  if (cta) cta.classList.add('best-sellers-cta');

  // right cards grid
  const grid = document.createElement('div');
  grid.classList.add('best-sellers-grid');

  // rows 2+ = product cards (dynamic)
  rows.slice(1).forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const imgCol = cols[0];
    const dataCol = cols[1];
    if (!dataCol) return;

    // read data dynamically from rows
    const paras = [...dataCol.querySelectorAll('p')];
    const name = paras[0]?.textContent.trim() || '';
    const type = paras[1]?.textContent.trim() || '';
    const price = paras[2]?.textContent.trim() || '';
    const rating = parseFloat(paras[3]?.textContent.trim()) || 0;
    const reviews = paras[4]?.textContent.trim() || '0';
    const colors = paras[5]?.textContent.trim() || '';
    const stock = paras[6]?.textContent.trim() || '';
    const cartLink = dataCol.querySelector('a');

    // build card
    const card = document.createElement('div');
    card.classList.add('best-sellers-card');

    // heart wishlist button
    const heart = document.createElement('button');
    heart.classList.add('best-sellers-heart');
    heart.setAttribute('aria-label', 'Add to wishlist');
    heart.innerHTML = '&#9825;';
    heart.addEventListener('click', () => {
      heart.classList.toggle('active');
      heart.innerHTML = heart.classList.contains('active') ? '&#9829;' : '&#9825;';
    });

    // image
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('best-sellers-img');
    const img = imgCol?.querySelector('img');
    if (img) imgWrapper.append(img.cloneNode(true));

    // details
    const details = document.createElement('div');
    details.classList.add('best-sellers-details');
    details.innerHTML = `
      <p class="best-sellers-name">${name}</p>
      <p class="best-sellers-type">${type}</p>
      <p class="best-sellers-price">${price}</p>
      <div class="best-sellers-rating">
        <span class="best-sellers-stars">${renderStars(rating)}</span>
        <span class="best-sellers-reviews"> | ${reviews} reviews</span>
      </div>
      <div class="best-sellers-colors">
        <span class="best-sellers-colors-label"></span>
        ${renderColors(colors)}
      </div>
      <p class="best-sellers-stock">Only ${stock} left in stock</p>
    `;

    // Add to Cart button
    const btn = document.createElement('a');
    btn.href = cartLink?.href || '#';
    btn.textContent = 'Add to Cart';
    btn.classList.add('best-sellers-cart');
    details.append(btn);

    card.append(heart);
    card.append(imgWrapper);
    card.append(details);
    grid.append(card);
  });

  wrapper.append(leftSection);
  wrapper.append(grid);
  block.textContent = '';
  block.append(wrapper);
}
