export default function decorate(block) {
  // product-detail block is just a layout wrapper
  // it receives the rendered fragments as children
  // and arranges them in two columns

  const section = block.closest('.section');
  if (!section) return;

  // find all fragment wrappers in the section
  const allBlocks = [...section.querySelectorAll(':scope > div')];

  // identify gallery, details and accordion blocks
  const galleryBlock = section.querySelector('.pdp-gallery-wrapper, .pdp-gallery');
  const detailsBlock = section.querySelector('.pdp-details-wrapper, .product-detail-wrapper');
  const accordionBlock = section.querySelector('.pdp-accordion-wrapper, .pdp-accordion');

  if (!galleryBlock && !detailsBlock) return;

  // create left column
  const leftCol = document.createElement('div');
  leftCol.classList.add('pdp-left-col');
  if (galleryBlock) leftCol.append(galleryBlock);

  // create right column
  const rightCol = document.createElement('div');
  rightCol.classList.add('pdp-right-col');
  if (detailsBlock) rightCol.append(detailsBlock);
  if (accordionBlock) rightCol.append(accordionBlock);

  // create layout wrapper
  const layout = document.createElement('div');
  layout.classList.add('pdp-two-col');
  layout.append(leftCol);
  layout.append(rightCol);

  block.textContent = '';
  block.append(layout);
}
