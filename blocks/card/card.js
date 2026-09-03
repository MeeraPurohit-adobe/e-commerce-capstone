function loadCardCSS() {
  const cssPath = '/blocks/card/card.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

export function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
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
    return `<button class="card-color-dot" style="background:${color.toLowerCase()}" title="${color}" aria-label="${color}"></button>`;
  }).join('');
}

export function buildCard(product) {
  loadCardCSS();

  const card = document.createElement('div');
  card.classList.add('card-item');

  // make card clickable — navigate to product detail page
  card.style.cursor = 'pointer';
card.addEventListener('click', (e) => {
  if (e.target.closest('.card-heart') || e.target.closest('.card-cta')) return;
  const productId = product.id || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  window.location.href = `/products/product-detail-page?id=${productId}`;
});

  // heart wishlist button
  const heart = document.createElement('button');
  heart.classList.add('card-heart');
  heart.setAttribute('aria-label', 'Add to wishlist');
  heart.innerHTML = '&#9825;';
  heart.addEventListener('click', () => {
    heart.classList.toggle('active');
    heart.innerHTML = heart.classList.contains('active') ? '&#9829;' : '&#9825;';
  });

  // image
  const imgWrapper = document.createElement('div');
  imgWrapper.classList.add('card-img');
  imgWrapper.innerHTML = `<img src="${product.image}" alt="${product.name}" loading="lazy">`;

  // details
  const details = document.createElement('div');
  details.classList.add('card-details');
  details.innerHTML = `
    <p class="card-name">${product.name}</p>
    <p class="card-type">${product.type}</p>
    <p class="card-price">${product.price}</p>
    <div class="card-rating">
      <span class="card-stars">${renderStars(parseFloat(product.rating))}</span>
      <span class="card-reviews">(${product.reviews})</span>
    </div>
    <div class="card-colors">
      ${renderColors(product.colors)}
    </div>
    <p class="card-stock">Only ${product.stock} left in stock</p>
  `;

  // Add to Cart button — navigates to PDP
  const btn = document.createElement('a');
  btn.href = '#';
  btn.textContent = 'Add to Cart';
  btn.classList.add('card-cta');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `/products/product-detail-page?id=${product.id}`;
  });
  details.append(btn);

  card.append(heart);
  card.append(imgWrapper);
  card.append(details);

  return card;
}

export default function decorate(block) {
  loadCardCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const cols = [...rows[0].querySelectorAll(':scope > div')];
  const imgCol = cols[0];
  const dataCol = cols[1];
  if (!dataCol) return;

  const paras = [...dataCol.querySelectorAll('p')];
  const product = {
    image: imgCol?.querySelector('img')?.src || '',
    name: paras[0]?.textContent.trim() || '',
    type: paras[1]?.textContent.trim() || '',
    price: paras[2]?.textContent.trim() || '',
    rating: paras[3]?.textContent.trim() || '0',
    reviews: paras[4]?.textContent.trim() || '0',
    colors: paras[5]?.textContent.trim() || '',
    stock: paras[6]?.textContent.trim() || '0',
    link: dataCol.querySelector('a')?.href || '#',
  };

  const card = buildCard(product);
  block.textContent = '';
  block.append(card);
}
