export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // first row = header row (heading + shop now button)
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

  // remaining rows = category cards
  const track = document.createElement('div');
  track.classList.add('categories-track');

  rows.slice(1).forEach((row) => {
    const card = document.createElement('div');
    card.classList.add('categories-card');

    const cols = [...row.querySelectorAll(':scope > div')];
    const mediaCol = cols[0];

    if (mediaCol) {
      // check for image
      const img = mediaCol.querySelector('img');
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('categories-img-wrapper');

      if (img) {
        imgWrapper.append(img);
      } else {
        // use emoji/text as placeholder
        const placeholder = document.createElement('div');
        placeholder.classList.add('categories-placeholder');
        placeholder.textContent = mediaCol.querySelector('p')?.textContent || '';
        imgWrapper.append(placeholder);
      }

      // label - second paragraph
      const paras = mediaCol.querySelectorAll('p');
      const label = document.createElement('p');
      label.classList.add('categories-label');
      label.textContent = paras[paras.length - 1]?.textContent || '';

      card.append(imgWrapper);
      card.append(label);
    }

    track.append(card);
  });

  // clear block and rebuild
  block.textContent = '';
  block.append(header);
  block.append(track);
}
