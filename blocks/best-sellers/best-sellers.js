import { buildCard } from '../card/card.js';

export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const headerRow = rows[0];
  const headerCols = [...headerRow.querySelectorAll(':scope > div')];

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
  grid.innerHTML = '<p class="best-sellers-loading">Loading...</p>';

  wrapper.append(leftSection);
  wrapper.append(grid);
  block.textContent = '';
  block.append(wrapper);

  try {
    // fetch from sheet
    const resp = await fetch('/data/plants-listing.json?limit=6');
    if (!resp.ok) throw new Error('Failed to fetch');
    const json = await resp.json();
    const products = json.data || [];

    grid.textContent = '';

    if (!products.length) {
      grid.innerHTML = '<p class="best-sellers-error">No products found.</p>';
      return;
    }

    // build each card dynamically using card.js
    products.forEach((product) => {
      const card = buildCard(product);
      grid.append(card);
    });
  } catch (e) {
    grid.innerHTML = '<p class="best-sellers-error">Failed to load products.</p>';
  }
}
