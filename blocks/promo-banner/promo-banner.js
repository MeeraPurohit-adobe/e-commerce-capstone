export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const col = row.querySelector(':scope > div');
  if (!col) return;

  // wrap content
  const content = document.createElement('div');
  content.classList.add('promo-banner-content');
  content.innerHTML = col.innerHTML;

  // style CTA as button
  const cta = content.querySelector('a');
  if (cta) cta.classList.add('promo-banner-cta');

  block.textContent = '';
  block.append(content);
}
