export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header (heading + description + CTA)
  const headerRow = rows[0];
  const headerCol = headerRow.querySelector(':scope > div');

  const header = document.createElement('div');
  header.classList.add('our-plants-header');

  if (headerCol) {
    const heading = headerCol.querySelector('h2');
    const paras = [...headerCol.querySelectorAll('p')];
    const cta = headerCol.querySelector('a');

    // heading
    const headingWrapper = document.createElement('div');
    headingWrapper.classList.add('our-plants-heading');
    if (heading) headingWrapper.append(heading);

    // description + button on same line
    const descRow = document.createElement('div');
    descRow.classList.add('our-plants-desc-row');

    // description text
    const desc = document.createElement('p');
    desc.classList.add('our-plants-desc');
    desc.textContent = paras[0]?.textContent.trim() || '';

    // CTA button
    if (cta) cta.classList.add('our-plants-cta');

    descRow.append(desc);
    if (cta) descRow.append(cta);

    header.append(headingWrapper);
    header.append(descRow);
  }

  // carousel track
  const carouselWrapper = document.createElement('div');
  carouselWrapper.classList.add('our-plants-carousel-wrapper');

  // prev button
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('our-plants-prev');
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8592;';

  // next button
  const nextBtn = document.createElement('button');
  nextBtn.classList.add('our-plants-next');
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8594;';

  const track = document.createElement('div');
  track.classList.add('our-plants-track');

  // rows 2+ = plant cards
  rows.slice(1).forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const imgCol = cols[0];
    const dataCol = cols[1];
    if (!dataCol) return;

    const paras = [...dataCol.querySelectorAll('p')];
    const name = paras[0]?.textContent.trim() || '';
    const desc = paras[1]?.textContent.trim() || '';
    const price = paras[2]?.textContent.trim() || '';

    // build card
    const card = document.createElement('div');
    card.classList.add('our-plants-card');

    // image
    const imgWrapper = document.createElement('div');
    imgWrapper.classList.add('our-plants-card-img');
    const img = imgCol?.querySelector('img');
    if (img) imgWrapper.append(img.cloneNode(true));

    // details
    const details = document.createElement('div');
    details.classList.add('our-plants-card-details');
    details.innerHTML = `
      <p class="our-plants-card-name">${name}</p>
      <p class="our-plants-card-desc">${desc}</p>
      <p class="our-plants-card-price">${price}</p>
    `;

    card.append(imgWrapper);
    card.append(details);
    track.append(card);
  });

  // scroll logic
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -300, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: 300, behavior: 'smooth' });
  });

  carouselWrapper.append(prevBtn);
  carouselWrapper.append(track);
  carouselWrapper.append(nextBtn);

  block.textContent = '';
  block.append(header);
  block.append(carouselWrapper);
}
