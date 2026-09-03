export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div > div > p')];
  if (!items.length) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');
  nav.classList.add('breadcrumb-nav');

  const ol = document.createElement('ol');
  ol.classList.add('breadcrumb-list');

  // check if this is a PDP breadcrumb
  const isPDP = items.length === 1 && items[0]?.textContent.trim() === 'pdp';

  if (isPDP) {
    // build PDP breadcrumb dynamically
    const pdpItems = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products/product-listing-page' },
      { label: 'Product Detail', href: '/products/product-detail-page' },
      { label: '', href: null, className: 'pdp-breadcrumb-name' },
    ];

    pdpItems.forEach(({ label, href, className }) => {
      const li = document.createElement('li');
      li.classList.add('breadcrumb-item');

      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        a.classList.add('breadcrumb-link');
        li.append(a);

        const sep = document.createElement('span');
        sep.classList.add('breadcrumb-sep');
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        li.append(sep);
      } else {
        // last item - product name (populated dynamically)
        const span = document.createElement('span');
        span.classList.add('breadcrumb-current');
        if (className) span.classList.add(className);
        span.setAttribute('aria-current', 'page');
        span.textContent = label;
        if (!label) li.classList.add('breadcrumb-hidden');
        li.append(span);
      }

      ol.append(li);
    });
  } else {
    // standard breadcrumb - read from block content
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.classList.add('breadcrumb-item');

      const isLast = index === items.length - 1;
      const link = item.querySelector('a');

      if (link && !isLast) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent.trim();
        a.classList.add('breadcrumb-link');
        li.append(a);

        const sep = document.createElement('span');
        sep.classList.add('breadcrumb-sep');
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        li.append(sep);
      } else {
        const span = document.createElement('span');
        span.classList.add('breadcrumb-current');
        span.setAttribute('aria-current', 'page');
        span.textContent = item.textContent.trim();
        li.append(span);
      }

      ol.append(li);
    });
  }

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}