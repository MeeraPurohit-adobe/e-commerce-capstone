export default function decorate(block) {
  // Read field definitions from block rows
  const rows = [...block.querySelectorAll(':scope > div')];

  // Skip header row (Field Label, Field Type, etc.)
  const fieldRows = rows.slice(1);

  // Create form element
  const form = document.createElement('form');
  form.setAttribute('novalidate', '');

  // Create inline wrapper for input + button
  const inputWrapper = document.createElement('div');
  inputWrapper.classList.add('form-input-wrapper');

  fieldRows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const label = cols[0]?.textContent.trim();
    const type = cols[1]?.textContent.trim();
    const placeholder = cols[2]?.textContent.trim();
    const name = cols[3]?.textContent.trim();
    const required = cols[4]?.textContent.trim() === 'true';

    if (type === 'submit') {
      // Create submit button with arrow
      const button = document.createElement('button');
      button.type = 'submit';
      button.classList.add('form-submit');
      button.setAttribute('aria-label', 'Subscribe');
      button.textContent = label || '→';
      inputWrapper.append(button);
    } else {
      // Create input field
      const input = document.createElement('input');
      input.type = type || 'text';
      input.name = name || type;
      input.placeholder = placeholder || '';
      input.required = required;
      input.classList.add('form-input');
      if (label) input.setAttribute('aria-label', label);
      inputWrapper.prepend(input);
    }
  });

  form.append(inputWrapper);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
      // Replace form with success message
      const success = document.createElement('p');
      success.classList.add('form-success');
      success.textContent = 'Thank you for subscribing!';
      block.textContent = '';
      block.append(success);
    }
  });

  // Replace block content with form
  block.textContent = '';
  block.append(form);
}