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
  if (!colorsStr) return '';
  return colorsStr.split(',').map((c) => {
    const color = c.trim();
    return `<button class="best-sellers-color-dot" style="background:${color.toLowerCase()}" title="${color}" aria-label="${color}"></button>`;
  }).join('');
}

function buildCard(product) {
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
  imgWrapper.innerHTML = `<img src="${product.image}" alt="${product.name}" loading="lazy">`;

  // details
  const details = document.createElement('div');
  details.classList.add('best-sellers-details');
  details.innerHTML = `
    <p class="best-sellers-name">${product.name}</p>
    <p class="best-sellers-type">${product.type}</p>
    <p class="best-sellers-price">${product.price}</p>
    <div class="best-sellers-rating">
      <span class="best-sellers-stars">${renderStars(parseFloat(product.rating))}</span>
      <span class="best-sellers-reviews">| ${product.reviews} reviews</span>
    </div>
    <div class="best-sellers-colors">
      ${renderColors(product.colors)}
    </div>
    <p class="best-sellers-stock">Only ${product.stock} left in stock</p>
  `;

  // Add to Cart button
  const btn = document.createElement('a');
  btn.href = product.link || '#';
  btn.textContent = 'Add to Cart';
  btn.classList.add('best-sellers-cart');
  details.append(btn);

  card.append(heart);
  card.append(imgWrapper);
  card.append(details);

  return card;
}

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header (left text + right placeholder)
  const headerRow = rows[0];
  const headerCols = [...headerRow.querySelectorAll(':scope > div')];

  // build wrapper
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

  // loading state
  grid.innerHTML = '<p class="best-sellers-loading">Loading...</p>';

  wrapper.append(leftSection);
  wrapper.append(grid);
  block.textContent = '';
  block.append(wrapper);

  // fetch data from sheet
  try {
    const resp = await fetch('/data/best-sellers.json');
    if (!resp.ok) throw new Error('Failed to fetch');
    const json = await resp.json();
    const products = json.data || [];

    // clear loading
    grid.textContent = '';

    if (!products.length) {
      grid.innerHTML = '<p class="best-sellers-error">No products found.</p>';
      return;
    }

    // render each product as a card
    products.forEach((product) => {
      const card = buildCard(product);
      grid.append(card);
    });
  } catch (e) {
    grid.innerHTML = '<p class="best-sellers-error">Failed to load products.</p>';
  }
}