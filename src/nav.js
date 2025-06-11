import { startDiscordLogin, logout, getUser } from './auth.js';

console.log('[nav] Script start');

// Wait until all nav elements are present in DOM
async function waitForNavElements(timeout = 1000) {
  const required = ['login-btn', 'logout-btn', 'user-info', 'display-name'];
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const missing = required.filter(id => !document.getElementById(id));
    if (missing.length === 0) return true;
    await new Promise(r => setTimeout(r, 50));
  }
  console.warn('[nav] Timeout waiting for nav elements');
  return false;
}

const show = id => {
  const el = document.getElementById(id);
  if (el) {
    console.log(`[nav] Showing ${id}`);
    el.classList.remove('hidden');
  }
};

const hide = id => {
  const el = document.getElementById(id);
  if (el) {
    console.log(`[nav] Hiding ${id}`);
    el.classList.add('hidden');
    if (id === 'user-info') el.classList.remove('lg:inline-block');
  }
};

function runNavLogic() {
  const token = localStorage.getItem('jwt');
  console.log('[nav] Token:', token);

  waitForNavElements().then(() => {
    let user = null;
    if (token) {
      try {
        user = getUser();
        console.log('[nav] User:', user);
      } catch (err) {
        console.warn('[nav] Failed to get user:', err);
      }
    }

    const isAdmin = user?.roles?.includes('Server Admin');
    console.log('[nav] Is admin:', isAdmin);

    // Bind login/logout buttons
    document.getElementById('login-btn')?.addEventListener('click', startDiscordLogin);
    document.getElementById('login-btn-mobile')?.addEventListener('click', startDiscordLogin);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('logout-btn-mobile')?.addEventListener('click', logout);

    if (user) {
      document.getElementById('display-name').textContent = user.displayName;

      show('user-info');
      show('logout-btn'); show('logout-btn-mobile');
      hide('login-btn'); hide('login-btn-mobile');

      if (isAdmin) {
        show('admin-link'); show('admin-link-mobile'); show('admin-container');
      } else {
        hide('admin-link'); hide('admin-link-mobile'); hide('admin-container');
        if (window.location.pathname.includes('admin.html')) {
          console.log('[nav] Redirecting non-admin');
          window.location.href = '../unauthorized.html';
        }
      }
    } else {
      show('login-btn'); show('login-btn-mobile');
      hide('logout-btn'); hide('logout-btn-mobile');
      hide('user-info');
      hide('admin-link'); hide('admin-link-mobile');
      hide('admin-container');
      if (window.location.pathname.includes('admin.html')) {
        console.log('[nav] Redirecting unauthenticated user');
        window.location.href = '../unauthorized.html';
      }
    }

    console.log('[nav] Logic complete');
  });
}

document.addEventListener('nav-ready', () => {
  console.log('[nav] nav-ready fired');
  runNavLogic();
});

document.addEventListener('login-success', () => {
  console.log('[nav] login-success event received — rerunning logic');
  runNavLogic();
});

document.addEventListener('nav-ready', () => {
  console.log('[nav] nav-ready fired');
  runNavLogic();

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu-mobile');

  if (toggle && menu) {
    console.log('[nav] Hamburger elements found — binding toggle');
    toggle.addEventListener('click', () => {
      console.log('[nav] Toggling mobile menu');
      menu.classList.toggle('hidden');
      menu.style.maxHeight = menu.classList.contains('hidden') ? null : menu.scrollHeight + 'px';
    });
  } else {
    console.warn('[nav] Couldn’t find nav-toggle or nav-menu-mobile');
  }
});

// Expose to window for SPA reloads
export function init() {
  runNavLogic()
}

