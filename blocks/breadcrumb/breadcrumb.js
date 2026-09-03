export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div > div > p')];
  if (!items.length) return;

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');
  nav.classList.add('breadcrumb-nav');

  const ol = document.createElement('ol');
  ol.classList.add('breadcrumb-list');

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

      // check if it has pdp-breadcrumb-name class
      if (item.classList.contains('pdp-breadcrumb-name')) {
        span.classList.add('pdp-breadcrumb-name');
      }

      span.setAttribute('aria-current', 'page');
      span.textContent = item.textContent.trim();

      // hide if empty - will be populated by pdp-details.js
      if (!span.textContent) li.classList.add('breadcrumb-hidden');

      li.append(span);
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}