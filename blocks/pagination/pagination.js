function loadPaginationCSS() {
  const cssPath = '/blocks/pagination/pagination.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
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
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });

  const nextBtn = document.createElement('button');
  nextBtn.classList.add('pagination-btn', 'pagination-next');
  nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });

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
      btn.addEventListener('click', () => onPageChange(page));
      li.append(btn);
    }
    pageList.append(li);
  });

  nav.append(prevBtn);
  nav.append(pageList);
  nav.append(nextBtn);
  container.append(nav);
}

// standalone block decorator - renders a preview with 10 pages
export default function decorate(block) {
  loadPaginationCSS();
  block.textContent = '';
  renderPagination(block, 1, 10, (page) => {
    // update active state on standalone preview
    block.querySelectorAll('.pagination-page-btn').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.textContent, 10) === page);
    });
  });
}
