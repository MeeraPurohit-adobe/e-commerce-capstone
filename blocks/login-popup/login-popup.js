function loadCSS() {
  const cssPath = '/blocks/login-popup/login-popup.css';
  if (!document.querySelector(`link[href="${cssPath}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.append(link);
  }
}

async function fetchUsers() {
  try {
    const resp = await fetch('/data/users.json?limit=20');
    if (!resp.ok) throw new Error('Failed to fetch users');
    const json = await resp.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

function getRedirectUrl(block) {
  const link = block.querySelector('a');
  return link?.href || '/account/account';
}

export function openLoginPopup() {
  const popup = document.querySelector('.login-popup-overlay');
  if (popup) {
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeLoginPopup() {
  const popup = document.querySelector('.login-popup-overlay');
  if (popup) {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export default function decorate(block) {
  loadCSS();

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // read content from block
  const headingText = rows[0]?.querySelector('h2')?.textContent || 'Login to Continue';
  const subText = rows[0]?.querySelector('p')?.textContent || 'Please login to proceed to checkout';
  const emailLabel = rows[1]?.querySelector('p:first-child')?.textContent || 'Email';
  const emailPlaceholder = rows[1]?.querySelector('p:last-child')?.textContent || 'Enter your email address';
  const firstNameLabel = rows[2]?.querySelector('p:first-child')?.textContent || 'First Name';
  const firstNamePlaceholder = rows[2]?.querySelector('p:last-child')?.textContent || 'Enter your first name';
  const lastNameLabel = rows[3]?.querySelector('p:first-child')?.textContent || 'Last Name';
  const lastNamePlaceholder = rows[3]?.querySelector('p:last-child')?.textContent || 'Enter your last name';
  const btnText = rows[4]?.querySelector('p')?.textContent || 'Login';
  const redirectUrl = getRedirectUrl(block);

  // build overlay
  const overlay = document.createElement('div');
  overlay.classList.add('login-popup-overlay');

  // build popup panel
  const panel = document.createElement('div');
  panel.classList.add('login-popup-panel');

  // close button
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('login-popup-close');
  closeBtn.setAttribute('aria-label', 'Close login popup');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeLoginPopup);

  // heading
  const heading = document.createElement('h2');
  heading.classList.add('login-popup-heading');
  heading.textContent = headingText;

  const sub = document.createElement('p');
  sub.classList.add('login-popup-sub');
  sub.textContent = subText;

  // form
  const form = document.createElement('form');
  form.classList.add('login-popup-form');
  form.setAttribute('novalidate', '');

  // email field
  const emailGroup = document.createElement('div');
  emailGroup.classList.add('login-popup-field');
  const emailLabelEl = document.createElement('label');
  emailLabelEl.textContent = emailLabel;
  emailLabelEl.setAttribute('for', 'login-email');
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'login-email';
  emailInput.classList.add('login-popup-input');
  emailInput.placeholder = emailPlaceholder;
  emailInput.required = true;
  emailGroup.append(emailLabelEl);
  emailGroup.append(emailInput);

  // first name field
  const firstNameGroup = document.createElement('div');
  firstNameGroup.classList.add('login-popup-field');
  const firstNameLabelEl = document.createElement('label');
  firstNameLabelEl.textContent = firstNameLabel;
  firstNameLabelEl.setAttribute('for', 'login-firstname');
  const firstNameInput = document.createElement('input');
  firstNameInput.type = 'text';
  firstNameInput.id = 'login-firstname';
  firstNameInput.classList.add('login-popup-input');
  firstNameInput.placeholder = firstNamePlaceholder;
  firstNameInput.required = true;
  firstNameGroup.append(firstNameLabelEl);
  firstNameGroup.append(firstNameInput);

  // last name field
  const lastNameGroup = document.createElement('div');
  lastNameGroup.classList.add('login-popup-field');
  const lastNameLabelEl = document.createElement('label');
  lastNameLabelEl.textContent = lastNameLabel;
  lastNameLabelEl.setAttribute('for', 'login-lastname');
  const lastNameInput = document.createElement('input');
  lastNameInput.type = 'text';
  lastNameInput.id = 'login-lastname';
  lastNameInput.classList.add('login-popup-input');
  lastNameInput.placeholder = lastNamePlaceholder;
  lastNameInput.required = true;
  lastNameGroup.append(lastNameLabelEl);
  lastNameGroup.append(lastNameInput);

  // error message
  const errorMsg = document.createElement('p');
  errorMsg.classList.add('login-popup-error');
  errorMsg.style.display = 'none';

  // submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.classList.add('login-popup-submit');
  submitBtn.textContent = btnText;

  form.append(emailGroup);
  form.append(firstNameGroup);
  form.append(lastNameGroup);
  form.append(errorMsg);
  form.append(submitBtn);

  // form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';

    const email = emailInput.value.trim().toLowerCase();
    const firstName = firstNameInput.value.trim().toLowerCase();
    const lastName = lastNameInput.value.trim().toLowerCase();

    if (!email || !firstName || !lastName) {
      errorMsg.textContent = 'Please fill in all fields.';
      errorMsg.style.display = 'block';
      return;
    }

    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;

    // fetch users from DA sheet
    const users = await fetchUsers();

    // match all three fields
    const matchedUser = users.find((u) => u.email.toLowerCase() === email
      && u.first_name.toLowerCase() === firstName
      && u.last_name.toLowerCase() === lastName);

    if (matchedUser) {
      // save to sessionStorage
      sessionStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
      closeLoginPopup();
      // redirect to account page
      window.location.href = redirectUrl;
    } else {
      errorMsg.textContent = 'You are not Authorised to login.';
      errorMsg.style.display = 'block';
      submitBtn.textContent = btnText;
      submitBtn.disabled = false;
    }
  });

  // close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLoginPopup();
  });

  // close on escape
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeLoginPopup();
  });

  panel.append(closeBtn);
  panel.append(heading);
  panel.append(sub);
  panel.append(form);
  overlay.append(panel);

  block.textContent = '';
  block.append(overlay);
}
