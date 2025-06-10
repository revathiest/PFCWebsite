export async function init() {
    console.log('[unauthorized.js] Init called');
  
    // Optional: Add any interactive behaviour here
    const homeBtn = document.querySelector('a[data-link]');
    homeBtn?.addEventListener('click', e => {
      e.preventDefault();
      history.pushState(null, null, '/');
      loadInitialRoute(); // Should already exist in your SPA setup
    });
  }
  