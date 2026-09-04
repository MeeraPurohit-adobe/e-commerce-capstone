import { buildCard } from '../card/card.js';
import { getWishlist } from '../../scripts/wishlist-utils.js';

function loadCSS() {
    const cssPath = '/blocks/wishlist/wishlist.css';
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.append(link);
    }
}

export default function decorate(block) {
    loadCSS();

    const rows = [...block.querySelectorAll(':scope > div')];
    const heading = rows[0]?.querySelector('h1');

    const wrapper = document.createElement('div');
    wrapper.classList.add('wishlist-wrapper');

    // heading row
    const headingRow = document.createElement('div');
    headingRow.classList.add('wishlist-heading-row');
    if (heading) headingRow.append(heading);

    const countSpan = document.createElement('span');
    countSpan.classList.add('wishlist-count');

    // cards grid
    const grid = document.createElement('div');
    grid.classList.add('wishlist-grid');

    function renderWishlist() {
        grid.textContent = '';
        const wishlist = getWishlist();

        // update count
        countSpan.textContent = `(${wishlist.length})`;
        headingRow.append(countSpan);

        if (!wishlist.length) {
            const empty = document.createElement('div');
            empty.classList.add('wishlist-empty');
            empty.innerHTML = `
        <p class="wishlist-empty-icon">🤍</p>
        <p class="wishlist-empty-title">Your wishlist is empty</p>
        <p class="wishlist-empty-text">Save items you love by clicking the heart icon.</p>
        <a href="/products/product-listing-page" class="wishlist-empty-btn">Start Shopping</a>
      `;
            grid.append(empty);
            return;
        }

        wishlist.forEach((product) => {
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('wishlist-card-wrapper');

            // build card — heart will already be red since isWishlisted returns true
            const card = buildCard(product);
            cardWrapper.append(card);
            grid.append(cardWrapper);
        });
    }

    wrapper.append(headingRow);
    wrapper.append(grid);

    block.textContent = '';
    block.append(wrapper);

    renderWishlist();

    // re-render when wishlist changes
    window.addEventListener('wishlist-updated', renderWishlist);
}
