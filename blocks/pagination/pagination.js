function loadPaginationCSS() {
  const cssPath = '/blocks/pagination/pagination.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('page') || '1', 10);
}

function goToPage(page, totalPages, onPageChange) {
  if (page < 1 || page > totalPages) return;
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.history.pushState({}, '', url);
  onPageChange(page);
}

export function renderPagination(container, currentPage, totalPages, onPageChange) {
  loadPaginationCSS();
  container.textContent = '';
  if (totalPages <= 1) return;

  const nav = document.createElement('nav');
  nav.classList.add('pagination');
  nav.setAttribute('aria-label', 'pagination');

  const prevBtn = document.createElement('button');
  prevBtn.classList.add('pagination-btn', 'pagination-prev');
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => goToPage(currentPage - 1, totalPages, onPageChange));

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('pagination-btn', 'pagination-next');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1, totalPages, onPageChange));

  const pageList = document.createElement('ul');
  pageList.classList.add('pagination-list');

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  pages.forEach((page) => {
    const li = document.createElement('li');
    li.classList.add('pagination-item');
    if (page === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.classList.add('pagination-ellipsis');
      ellipsis.textContent = '...';
      li.append(ellipsis);
    } else {
      const btn = document.createElement('button');
      btn.classList.add('pagination-page-btn');
      btn.textContent = page;
      if (page === currentPage) btn.classList.add('active');
      btn.addEventListener('click', () => goToPage(page, totalPages, onPageChange));
      li.append(btn);
    }
    pageList.append(li);
  });

  nav.append(prevBtn);
  nav.append(pageList);
  nav.append(nextBtn);
  container.append(nav);
}

export default async function decorate(block) {
  loadPaginationCSS();
  block.textContent = '';

  const PAGE_SIZE = 10;

  async function initPagination() {
    // wait for product-listing to store total records
    let totalRecords = parseInt(sessionStorage.getItem('total-records') || '0', 10);

    // if not yet set, fetch total from sheet
    if (!totalRecords) {
      try {
        const resp = await fetch('/data/plants-listing.json?limit=1000');
        if (!resp.ok) throw new Error('Failed');
        const json = await resp.json();
        totalRecords = (json.data || []).length;
        sessionStorage.setItem('total-records', totalRecords);
      } catch (e) {
        totalRecords = 100;
      }
    }

    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
    let currentPage = getPageFromURL();

    function onPageChange(newPage) {
      currentPage = newPage;
      renderPagination(block, currentPage, totalPages, onPageChange);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderPagination(block, currentPage, totalPages, onPageChange);

    // listen for browser back/forward
    window.addEventListener('popstate', () => {
      currentPage = getPageFromURL();
      renderPagination(block, currentPage, totalPages, onPageChange);
    });
  }

  // small delay to allow product-listing to set sessionStorage first
  setTimeout(initPagination, 100);
}
