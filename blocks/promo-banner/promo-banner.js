export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.querySelectorAll(':scope > div')];

  // image column - left
  if (cols[0]) cols[0].classList.add('promo-banner-image');

  // text column - right
  if (cols[1]) cols[1].classList.add('promo-banner-text');

  // first p = label
  const paras = cols[1]?.querySelectorAll('p');
  if (paras && paras[0]) paras[0].classList.add('promo-banner-label');

  // last p containing link = CTA
  const cta = cols[1]?.querySelector('a');
  if (cta) cta.classList.add('promo-banner-cta');
}
