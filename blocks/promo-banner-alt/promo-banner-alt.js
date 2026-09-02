export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.querySelectorAll(':scope > div')];

  // image column - left
  if (cols[0]) cols[0].classList.add('promo-banner-alt-image');

  // text column - right
  if (cols[1]) cols[1].classList.add('promo-banner-alt-text');

  // first p = label
  const label = cols[1]?.querySelector('p:first-child');
  if (label) label.classList.add('promo-banner-alt-label');

  // CTA button
  const cta = cols[1]?.querySelector('a');
  if (cta) cta.classList.add('promo-banner-alt-cta');
}
