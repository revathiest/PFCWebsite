console.log('[nav] Script start');

document.addEventListener('nav-ready', async () => {
  console.log('[nav] Nav Ready');

  const token = localStorage.getItem('jwt');
  console.log('[nav] Token:', token);

  // Wait for nav include to finish
  await waitForNavElements();

  if (token) {
    const user = PFCDiscord.getUser();
    console.log('[nav] User:', user);

    const isAdmin = Array.isArray(user.roles) && user.roles.includes('Server Admin');
    console.log('[nav] Is admin:', isAdmin);

    document.getElementById('display-name').textContent = user.displayName;

    show('user-info');
    show('logout-btn'); show('logout-btn-mobile');
    hide('login-btn'); hide('login-btn-mobile');

    if (isAdmin) {
      show('admin-link'); show('admin-link-mobile');
      show('admin-container');
    } else {
      hide('admin-link'); hide('admin-link-mobile');
      hide('admin-container');
      if (window.location.pathname.includes('admin')) {
        console.log('[nav] Redirecting non-admin');
        window.location.href = '/unauthorized';
      }
    }
  } else {
    console.log('[nav] No token — user not logged in');

    show('login-btn'); show('login-btn-mobile');
    hide('logout-btn'); hide('logout-btn-mobile');
    hide('user-info');
    hide('admin-link'); hide('admin-link-mobile');
    hide('admin-container');

    if (window.location.pathname.includes('admin')) {
      console.log('[nav] Redirecting unauthenticated user');
      window.location.href = '/unauthorized';
    }
  }

  console.log('[nav] Logic complete');
});

async function waitForNavElements(timeout = 1000, retries = 10) {
  for (let i = 0; i < retries; i++) {
    const el = document.getElementById('login-btn');
    if (el) return;
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  console.warn('[nav] Timeout waiting for nav elements');
}
