import { getUser } from './auth.js';
import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;
const PUBLIC_BASE_PATH = '';

const routes = {
  '/': 'views/home.html',
  '/accolades': 'views/accolades.html',
  '/accolade': 'views/accolade.html',
  '/events': 'views/events.html',
  '/changelog': 'views/changelog.html',
  '/officers': 'views/officers.html',
  '/friends': 'views/friends.html',
  '/admin': 'views/admin.html',
  '/log-search': 'views/log-search.html',
  '/content-manager': 'views/content-manager.html',
  '/unauthorized': 'views/unauthorized.html',
  '/friends/:sid': 'views/friend.html'
};

const protectedRoutes = ['/admin', '/log-search', '/content-manager'];

export async function navigateTo(url) {
  const target = new URL(url, window.location.origin);
  const nextPath = target.pathname + target.search;
  history.pushState(null, null, nextPath);
  await loadRoute();
}

function resolveRoute(path) {
  if (routes[path]) return routes[path];
  if (path.startsWith('/friends/')) return routes['/friends/:sid'];
  return routes['/'];
}

async function ensureAuthorized(path) {
  if (!protectedRoutes.includes(path)) return true;
  const user = await getUser();
  const isAdmin = user?.roles?.includes('Fleet Admiral');
  if (!user || !isAdmin) {
    console.warn('[router] Access denied to protected route:', path);
    await navigateTo('/unauthorized');
    return false;
  }
  return true;
}

function normalizePath(pathname) {
  if (!pathname) return '/';
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.replace(/\/+$/, '');
  }
  return pathname.endsWith('.html') ? pathname.replace(/\.html$/, '') : pathname;
}

async function loadRoute() {
  const path = normalizePath(window.location.pathname);
  const route = resolveRoute(path);
  const viewContainer = document.getElementById('view-container');

  if (!viewContainer) {
    console.error('[router] view-container not found!');
    return;
  }

  if (DEBUG) console.log('[router] path:', path, 'route:', route);

  const authorized = await ensureAuthorized(path);
  if (!authorized) return;

  try {
    const routePath = `${PUBLIC_BASE_PATH}/${route}`.replace(/\/{2,}/g, '/');
    if (DEBUG) console.log('[router] fetching:', routePath);
    const res = await fetch(routePath);
    if (!res.ok) throw new Error('Failed to fetch view: ' + routePath);

    const html = await res.text();
    const fullDoc = document.createElement('div');
    fullDoc.innerHTML = html;
    const newView = fullDoc.querySelector('#view-container');
    viewContainer.innerHTML = newView ? newView.innerHTML : html;

    document.dispatchEvent(new Event('nav-ready'));
    await loadPageModule(path);
  } catch (err) {
    console.error('[router] Error loading route:', err);
    viewContainer.innerHTML = '<p class="text-red-500 text-center">Error loading page.</p>';
  }
}

async function loadPageModule(path) {
  if (path.includes('accolades')) {
    if (DEBUG) console.log('[router] importing accolades.js');
    const module = await import('./accolades.js');
    module.init?.();
  } else if (path.includes('accolade')) {
    if (DEBUG) console.log('[router] importing accolade.js');
    const module = await import('./accolade.js');
    module.init?.();
  } else if (path.includes('events')) {
    if (DEBUG) console.log('[router] importing events.js');
    const module = await import('./events.js');
    module.init?.();
  } else if (path.includes('changelog')) {
    if (DEBUG) console.log('[router] importing changelog.js');
    const module = await import('./changelog.js');
    module.init?.();
  } else if (path.includes('officers')) {
    if (DEBUG) console.log('[router] importing officers.js');
    const module = await import('./officers.js');
    module.init?.();
  } else if (path.startsWith('/friends/')) {
    if (DEBUG) console.log('[router] importing friend.js');
    const module = await import('./friend.js');
    module.init?.();
  } else if (path.includes('friends')) {
    if (DEBUG) console.log('[router] importing friends.js');
    const module = await import('./friends.js');
    module.init?.();
  } else if (path.includes('admin')) {
    if (DEBUG) console.log('[router] importing admin.js');
    const module = await import('./admin.js');
    module.init?.();
  } else if (path.includes('log-search')) {
    if (DEBUG) console.log('[router] importing log-search.js');
    const module = await import('./log-search.js');
    module.init?.();
  } else if (path.includes('content-manager')) {
    if (DEBUG) console.log('[router] importing content-manager.js');
    const module = await import('./content-manager.js');
    module.init?.();
  } else if (path.includes('unauthorized')) {
    if (DEBUG) console.log('[router] importing unauthorized.js');
    const module = await import('./unauthorized.js');
    module.init?.();
  } else if (path === '/' || path === '/home') {
    if (DEBUG) console.log('[router] importing home.js');
    const module = await import('./home.js');
    module.init?.();
  }
}

function loadInitialRoute() {
  document.body.addEventListener('click', e => {
    const link = e.target.closest?.('a[data-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    navigateTo(url.pathname + url.search);
  });

  window.addEventListener('popstate', loadRoute);
  loadRoute();
}

export function init() {
  loadInitialRoute();
}
