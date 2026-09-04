function loadCSS() {
  const cssPath = '/blocks/account/account.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');
  } catch (e) {
    return null;
  }
}

export default function decorate(block) {
  loadCSS();

  const user = getLoggedInUser();

  // if not logged in redirect to 404
  if (!user) {
    window.location.href = '/404';
    return;
  }

  // user is logged in - show account page
  const wrapper = document.createElement('div');
  wrapper.classList.add('account-wrapper');

  const heading = block.querySelector('h1');
  if (heading) wrapper.append(heading);

  const welcome = document.createElement('p');
  welcome.classList.add('account-welcome');
  welcome.textContent = `Welcome, ${user.first_name} ${user.last_name}!`;

  wrapper.append(welcome);

  block.textContent = '';
  block.append(wrapper);
}