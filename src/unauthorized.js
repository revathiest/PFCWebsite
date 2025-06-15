import { navigateTo } from './router.js';

export async function init() {
  console.log('[unauthorized.js] Init called');

  // Optional: Add any interactive behaviour here
  const homeBtn = document.querySelector('a[data-link]');
  homeBtn?.addEventListener('click', e => {
    e.preventDefault();
    navigateTo('/');
  });
}
  