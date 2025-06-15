import { startDiscordLogin, logout, getUser } from './auth.js';
import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

if (DEBUG) console.log('[nav] Script start');

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
    if (DEBUG) console.log(`[nav] Showing ${id}`);
    el.classList.remove('hidden');
  }
};

const hide = id => {
  const el = document.getElementById(id);
  if (el) {
    if (DEBUG) console.log(`[nav] Hiding ${id}`);
    el.classList.add('hidden');
    if (id === 'user-info') el.classList.remove('lg:inline-block');
  }
};

function runNavLogic() {
  const token = localStorage.getItem('jwt');
  if (DEBUG) console.log('[nav] Token:', token);

  waitForNavElements().then(() => {
    let user = null;
    if (token) {
      try {
        user = getUser();
        if (DEBUG) console.log('[nav] User:', user);
      } catch (err) {
        console.warn('[nav] Failed to get user:', err);
      }
    }

    const isAdmin = user?.roles?.includes('Fleet Admiral');
    if (DEBUG) console.log('[nav] Is admin:', isAdmin);

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
        show('admin-link'); show('admin-link-mobile');
        show('admin-container');
      } else {
        hide('admin-link'); hide('admin-link-mobile');
        hide('admin-container');
        if (window.location.pathname.includes('admin.html')) {
          if (DEBUG) console.log('[nav] Redirecting non-admin');
          navigateTo('./unauthorized.html');
        }
      }
    } else {
      show('login-btn'); show('login-btn-mobile');
      hide('logout-btn'); hide('logout-btn-mobile');
      hide('user-info');
      hide('admin-link'); hide('admin-link-mobile');
      hide('admin-container');
      if (window.location.pathname.includes('admin.html')) {
        if (DEBUG) console.log('[nav] Redirecting unauthenticated user');
        navigateTo('./unauthorized.html');
      }
    }

    if (DEBUG) console.log('[nav] Logic complete');
  });
}

// Attach hamburger toggle once DOM is ready
document.addEventListener('nav-ready', () => {
  if (DEBUG) console.log('[nav] nav-ready fired');
  runNavLogic();
});

document.addEventListener('login-success', () => {
  if (DEBUG) console.log('[nav] login-success event received — rerunning logic');
  runNavLogic();
});

// Hamburger toggle support
document.addEventListener('nav-ready', () => {
  if (DEBUG) console.log('[nav] nav-ready fired');

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu-mobile');

  if (toggle && menu) {
    if (DEBUG) console.log('[nav] Hamburger elements found — binding toggle');
    toggle.addEventListener('click', () => {
      if (DEBUG) console.log('[nav] Toggling mobile menu');
      menu.classList.toggle('hidden');
      menu.style.maxHeight = menu.classList.contains('hidden') ? null : menu.scrollHeight + 'px';
    });
  } else {
    console.warn("[nav] Couldn't find nav-toggle or nav-menu-mobile");
  }
});

// Expose to SPA router
export function init() {
  runNavLogic();
}
