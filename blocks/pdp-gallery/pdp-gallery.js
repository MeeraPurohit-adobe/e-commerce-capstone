export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // read image URLs from links in each row
  const allImages = rows.map((row) => {
    const link = row.querySelector('a');
    const img = row.querySelector('img');

    // support both direct URL links and img tags
    if (link) {
      return {
        src: link.href,
        alt: link.textContent.trim() || 'Product image',
      };
    }
    if (img) {
      return {
        src: img.src,
        alt: img.alt || 'Product image',
      };
    }
    return null;
  }).filter(Boolean);

  if (!allImages.length) return;

  // main image wrapper
  const mainWrapper = document.createElement('div');
  mainWrapper.classList.add('pdp-gallery-main');

  const mainImg = document.createElement('img');
  mainImg.src = allImages[0].src;
  mainImg.alt = allImages[0].alt;
  mainImg.classList.add('pdp-gallery-main-img');
  mainWrapper.append(mainImg);

  // thumbnail strip
  const thumbStrip = document.createElement('div');
  thumbStrip.classList.add('pdp-gallery-thumbs');

  allImages.forEach((imgData, index) => {
    const thumb = document.createElement('div');
    thumb.classList.add('pdp-gallery-thumb');
    if (index === 0) thumb.classList.add('active');

    const thumbImg = document.createElement('img');
    thumbImg.src = imgData.src;
    thumbImg.alt = imgData.alt;
    thumbImg.loading = 'lazy';

    // click to switch main image
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
}
