// auth.js

import { runIncludes } from './includes.js';

export async function finishDiscordLogin() {
  console.log('finishDiscordLogin triggered.');

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  console.log('Parsed code from URL:', code);

  if (!code) {
    console.log('No code found in URL — skipping login finish.');
    return;
  }

  try {
    console.log('Sending POST request to exchange code...');
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    console.log('Received response:', response);
    const data = await response.json();
    console.log('Parsed response JSON:', data);

    localStorage.setItem('jwt', data.token);
    console.log('✅ JWT stored:', data.token);

    // Reload nav and run logic cleanly
    const navPlaceholder = document.querySelector('[data-include="partials/nav.html"]');
    if (navPlaceholder) navPlaceholder.remove();

    const newNav = document.createElement('div');
    newNav.setAttribute('data-include', 'partials/nav.html');
    document.body.insertBefore(newNav, document.body.firstChild);

    runIncludes();

    document.addEventListener('nav-ready', () => {
      console.log('[auth] Nav is ready — dispatching login-success');
      document.dispatchEvent(new Event('login-success'));
    }, { once: true });

  } catch (err) {
    console.error('❌ Error finishing Discord login:', err);
  }
}
