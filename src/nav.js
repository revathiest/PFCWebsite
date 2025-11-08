import { startDiscordLogin, logout, getUser } from './auth.js';
import { PFC_CONFIG } from './config.js';
import { navigateTo as routerNavigateTo } from './router.js';

const DEBUG = PFC_CONFIG.debug;
let controlsBound = false;

if (DEBUG) console.log('[nav] Script start');

const REQUIRED_IDS = ['login-btn', 'logout-btn', 'user-info', 'display-name'];

function navElementsPresent() {
  return REQUIRED_IDS.every(id => document.getElementById(id));
}

// Wait until all nav elements are present in DOM
async function waitForNavElements(timeout = 1000) {
  if (navElementsPresent()) return true;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 50));
    if (navElementsPresent()) return true;
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

function goTo(url) {
  if (typeof window !== 'undefined' && typeof window.navigateTo === 'function' && window.navigateTo !== routerNavigateTo) {
    window.navigateTo(url);
    return;
  }
  if (typeof routerNavigateTo === 'function') {
    routerNavigateTo(url);
    return;
  }
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

function bindNavControls() {
  if (controlsBound) return;

  document.getElementById('login-btn')?.addEventListener('click', startDiscordLogin);
  document.getElementById('login-btn-mobile')?.addEventListener('click', startDiscordLogin);
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('logout-btn-mobile')?.addEventListener('click', logout);

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu-mobile');
  if (!toggle || !menu) {
    console.warn("[nav] Couldn't find nav-toggle or nav-menu-mobile");
    return;
  }

  toggle.addEventListener('click', () => {
    if (DEBUG) console.log('[nav] Toggling mobile menu');
    menu.classList.toggle('hidden');
    menu.style.maxHeight = menu.classList.contains('hidden') ? null : menu.scrollHeight + 'px';
  });

  controlsBound = true;
}

async function runNavLogic() {
  const token = localStorage.getItem('jwt');
  if (DEBUG) console.log('[nav] Token:', token);

  if (!navElementsPresent()) {
    const haveNav = await waitForNavElements();
    if (!haveNav) {
      if (DEBUG) console.warn('[nav] Nav elements never appeared; skipping logic run');
      return;
    }
  }

  bindNavControls();

  try {
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
    const pathname = window.location.pathname;
    const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const isAdminRoute = normalizedPath === '/admin' || pathname.endsWith('admin.html');

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
        if (isAdminRoute) {
          if (DEBUG) console.log('[nav] Redirecting non-admin');
          goTo('./unauthorized.html');
        }
      }
    } else {
      show('login-btn'); show('login-btn-mobile');
      hide('logout-btn'); hide('logout-btn-mobile');
      hide('user-info');
      hide('admin-link'); hide('admin-link-mobile');
      hide('admin-container');
      if (isAdminRoute) {
        if (DEBUG) console.log('[nav] Redirecting unauthenticated user');
        goTo('./unauthorized.html');
      }
    }

    if (DEBUG) console.log('[nav] Logic complete');
  } catch (err) {
    console.error('[nav] Unexpected error during nav update:', err);
  }
}

document.addEventListener('nav-ready', () => {
  if (DEBUG) console.log('[nav] nav-ready fired');
  runNavLogic();
});

document.addEventListener('login-success', () => {
  if (DEBUG) console.log('[nav] login-success event received -- rerunning logic');
  runNavLogic();
});

// Expose to SPA router
export function init() {
  if (document.getElementById('login-btn')) {
    runNavLogic();
  }
}
