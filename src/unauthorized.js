import { PFC_CONFIG } from './config.js';
import { navigateTo } from './router.js';

const DEBUG = PFC_CONFIG.debug;

export async function init() {
  if (DEBUG) console.log('[unauthorized.js] Init called');

  const homeBtn = document.querySelector('a[data-link]');
  homeBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (typeof window !== 'undefined' && typeof window.loadInitialRoute === 'function') {
      window.loadInitialRoute();
    } else {
      navigateTo('/');
    }
  });
}
