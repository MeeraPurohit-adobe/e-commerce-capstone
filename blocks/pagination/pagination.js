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
  // update URL with new page
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

  // prev button
  const prevBtn = document.createElement('button');
  prevBtn.classList.add('pagination-btn', 'pagination-prev');
  prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => goToPage(currentPage - 1, totalPages, onPageChange));

  // next button
  const nextBtn = document.createElement('button');
  nextBtn.classList.add('pagination-btn', 'pagination-next');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1, totalPages, onPageChange));

  // page numbers with ellipsis
  const pageList = document.createElement('ul');
  pageList.classList.add('pagination-list');

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
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

  // fetch total records to calculate total pages
  try {
    const resp = await fetch('/data/plants-listing.json?offset=0&limit=1');
    if (!resp.ok) throw new Error('Failed to fetch');
    const json = await resp.json();
    const totalRecords = json.total || 100;
    const totalPages = Math.ceil(totalRecords / 10);
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

  } catch (e) {
    block.innerHTML = '<p>Failed to load pagination.</p>';
  }
}
