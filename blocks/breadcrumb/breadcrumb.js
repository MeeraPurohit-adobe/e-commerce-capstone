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
      // linked item with separator
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
      // current page - no link
      const span = document.createElement('span');
      span.classList.add('breadcrumb-current');
      span.setAttribute('aria-current', 'page');
      span.textContent = item.textContent.trim();
      li.append(span);
    }

    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
