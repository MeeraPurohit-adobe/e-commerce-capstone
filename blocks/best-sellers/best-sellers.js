export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.querySelectorAll(':scope > div')];

  // left column - text
  if (cols[0]) {
    cols[0].classList.add('best-sellers-left');

    // style Shop Now CTA
    const cta = cols[0].querySelector('a');
    if (cta) cta.classList.add('best-sellers-cta');
  }

  // right column - cards grid
  if (cols[1]) {
    cols[1].classList.add('best-sellers-right');

    // get the inner best-sellers-cards block
    const cardsBlock = cols[1].querySelector('.best-sellers-cards');
    if (cardsBlock) {
      const cards = [...cardsBlock.querySelectorAll(':scope > div')];
      cards.forEach((card) => {
        card.classList.add('best-sellers-card');

        // add wishlist heart button
        const heart = document.createElement('button');
        heart.classList.add('best-sellers-heart');
        heart.setAttribute('aria-label', 'Add to wishlist');
        heart.innerHTML = '&#9825;';
        heart.addEventListener('click', () => {
          heart.classList.toggle('active');
          heart.innerHTML = heart.classList.contains('active') ? '&#9829;' : '&#9825;';
        });
        card.prepend(heart);

        // style Add to Cart button
        const cartBtn = card.querySelector('a');
        if (cartBtn) cartBtn.classList.add('best-sellers-add-to-cart');
      });
    }
  }
}
