export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.querySelectorAll(':scope > div')];

  // text column - left
  if (cols[0]) cols[0].classList.add('promo-banner-alt-text');

  // image column - right
  if (cols[1]) cols[1].classList.add('promo-banner-alt-image');

  // first p = label
  const label = cols[0]?.querySelector('p:first-child');
  if (label) label.classList.add('promo-banner-alt-label');

  // CTA button
  const cta = cols[0]?.querySelector('a');
  if (cta) cta.classList.add('promo-banner-alt-cta');
}
