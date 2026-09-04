function loadCSS() {
    const cssPath = '/blocks/error-404/error-404.css';
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.append(link);
    }
}

export default function decorate(block) {
    loadCSS();

    const col = block.querySelector(':scope > div > div');
    if (!col) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('error-404-wrapper');

    const errorCode = document.createElement('div');
    errorCode.classList.add('error-404-code');
    errorCode.textContent = '404';

    const title = document.createElement('h2');
    title.classList.add('error-404-title');
    title.textContent = 'Page Not Found';

    const desc = document.createElement('p');
    desc.classList.add('error-404-desc');
    desc.textContent = "Oops! The page you are looking for does not exist or you don't have permission to access it.";

    const btnRow = document.createElement('div');
    btnRow.classList.add('error-404-btns');

    const homeBtn = document.createElement('a');
    homeBtn.href = '/';
    homeBtn.classList.add('error-404-btn', 'error-404-btn--primary');
    homeBtn.textContent = 'Go Back Home';

    const shopBtn = document.createElement('a');
    shopBtn.href = '/products/product-listing-page';
    shopBtn.classList.add('error-404-btn', 'error-404-btn--secondary');
    shopBtn.textContent = 'Continue Shopping';

    btnRow.append(homeBtn);
    btnRow.append(shopBtn);

    wrapper.append(errorCode);
    wrapper.append(title);
    wrapper.append(desc);
    wrapper.append(btnRow);

    block.textContent = '';
    block.append(wrapper);
}
