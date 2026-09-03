function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

async function fetchProductData(productId) {
  const resp = await fetch('/data/plants-listing.json?limit=1000');
  if (!resp.ok) throw new Error('Failed to fetch');
  const json = await resp.json();
  const products = json.data || [];
  return products.find((p) => String(p.id) === String(productId)) || null;
}

export default async function decorate(block) {
  const productId = getProductIdFromURL();

  // show loading state
  block.innerHTML = '<p class="pdp-gallery-loading">Loading...</p>';

  try {
    let images = [];

    if (productId) {
      // fetch from sheet dynamically
      const product = await fetchProductData(productId);

      if (product) {
        // read image-1 through image-5 from sheet
        ['image-1', 'image-2', 'image-3', 'image-4', 'image-5'].forEach((key) => {
          if (product[key]) {
            images.push({
              src: product[key],
              alt: `${product.name} - ${key}`,
            });
          }
        });
      }
    }

    // fallback to static links in block if no sheet data
    if (!images.length) {
      const rows = [...block.querySelectorAll(':scope > div')];
      images = rows.map((row) => {
        const link = row.querySelector('a');
        const img = row.querySelector('img');
        if (link) return { src: link.href, alt: link.textContent.trim() || 'Product image' };
        if (img) return { src: img.src, alt: img.alt || 'Product image' };
        return null;
      }).filter(Boolean);
    }

    if (!images.length) {
      block.innerHTML = '<p class="pdp-gallery-error">No images found.</p>';
      return;
    }

    // main image wrapper
    const mainWrapper = document.createElement('div');
    mainWrapper.classList.add('pdp-gallery-main');

    const mainImg = document.createElement('img');
    mainImg.src = images[0].src;
    mainImg.alt = images[0].alt;
    mainImg.classList.add('pdp-gallery-main-img');
    mainWrapper.append(mainImg);

    // thumbnail strip
    const thumbStrip = document.createElement('div');
    thumbStrip.classList.add('pdp-gallery-thumbs');

    images.forEach((imgData, index) => {
      const thumb = document.createElement('div');
      thumb.classList.add('pdp-gallery-thumb');
      if (index === 0) thumb.classList.add('active');

      const thumbImg = document.createElement('img');
      thumbImg.src = imgData.src;
      thumbImg.alt = imgData.alt;
      thumbImg.loading = 'lazy';

      thumb.addEventListener('click', () => {
        mainImg.src = imgData.src;
        mainImg.alt = imgData.alt;
        thumbStrip.querySelectorAll('.pdp-gallery-thumb')
          .forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });

      thumb.append(thumbImg);
      thumbStrip.append(thumb);
    });

    block.textContent = '';
    block.append(mainWrapper);
    block.append(thumbStrip);

  } catch (e) {
    block.innerHTML = '<p class="pdp-gallery-error">Failed to load images.</p>';
  }
}
