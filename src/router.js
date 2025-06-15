import { getUser } from './auth.js';
import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

// router.js
const routes = {
  '/': 'views/home.html',
  '/accolades': 'views/accolades.html',
  '/accolade': 'views/accolade.html',
  '/events': 'views/events.html',
  '/officers': 'views/officers.html',
  '/admin': 'views/admin.html',
  '/log-search': 'views/log-search.html',
  '/unauthorized': 'views/unauthorized.html',
  '/shop': 'views/shop.html',
  '/product/:handle': 'views/shop.html'
};

export function navigateTo(url) {
  history.pushState(null, null, url);
  loadRoute();
}

async function loadRoute() {
  const path = window.location.pathname;
  let route = routes[path];

  if (!route) {
    if (path.startsWith('/product/')) {
      route = routes['/product/:handle'];
    } else {
      route = routes['/'];
    }
  }

  const viewContainer = document.getElementById('view-container');

  if (!viewContainer) {
    console.error('[router] view-container not found!');
    return;
  }

  if (DEBUG) console.log(`[router] path: ${path}`);
  if (DEBUG) console.log(`[router] route: ${route}`);

  // Special case: protect /admin
  if (path === '/admin' || path === '/log-search') {
    const user = await getUser();
    const isAdmin = user?.roles?.includes('Server Admin');

    if (!user || !isAdmin) {
      console.warn('[router] Access denied to /admin for non-admin user.');
      navigateTo('/unauthorized');
      return;
    }
  }

  try {
    if (DEBUG) console.log(`[router] fetching: /${route}`);
    const res = await fetch('/' + route);
    if (!res.ok) throw new Error('Failed to fetch view: ' + route);

    const html = await res.text();

    // Replace only view container section between <!--view-start--> and <!--view-end-->
    const fullDoc = document.createElement('div');
    fullDoc.innerHTML = html;
    const newView = fullDoc.querySelector('#view-container');

    if (newView) {
      viewContainer.innerHTML = newView.innerHTML;
    } else {
      viewContainer.innerHTML = html; // fallback
    }

    // Dispatch nav-ready manually to re-trigger nav setup
    const navReadyEvent = new Event('nav-ready');
    window.dispatchEvent(navReadyEvent);

    // Load matching script module
    if (path.includes('accolades')) {
      if (DEBUG) console.log('[router] importing accolades.js');
      import('./accolades.js').then(m => m.init?.());
    } else if (path.includes('accolade')) {
      if (DEBUG) console.log('[router] importing accolade.js');
      import('./accolade.js').then(m => m.init?.());
    } else if (path.includes('events')) {
      if (DEBUG) console.log('[router] importing events.js');
      import('./events.js').then(m => m.init?.());
    } else if (path.includes('officers')) {
      if (DEBUG) console.log('[router] importing officers.js');
      import('./officers.js').then(m => m.init?.());
    } else if (path.includes('admin')) {
      if (DEBUG) console.log('[router] importing admin.js');
      import('./admin.js').then(m => m.init?.());
    } else if (path.includes('log-search')) {
      if (DEBUG) console.log('[router] importing log-search.js');
      import('./log-search.js').then(m => m.init?.());
    } else if (path.includes('unauthorized')) {
      if (DEBUG) console.log('[router] importing unauthorized.js');
      import('./unauthorized.js').then(m => m.init?.());
    } else if (path === '/' || path === '/home') {
      if (DEBUG) console.log('[router] importing home.js');
      import('./home.js').then(m => m.init?.());
    } else if (path.startsWith('/shop') || path.startsWith('/product/')) {
      if (DEBUG) console.log('[router] importing shop.js');
      import('./shop.js').then(m => m.init?.(path));
    }
  } catch (err) {
    console.error('[router] Error loading route:', err);
    viewContainer.innerHTML = '<p class="text-red-500 text-center">Error loading page.</p>';
  }
}

function loadInitialRoute() {
  document.body.addEventListener('click', e => {
    if (e.target.matches('a[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  loadRoute();
}

export function init() {
  loadInitialRoute();
}