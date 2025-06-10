// router.js
const routes = {
  '/': 'views/home.html',
  '/accolades': 'views/accolades.html',
  '/accolade': 'views/accolade.html',
  '/events': 'views/events.html',
  '/admin': 'views/admin.html',
  '/log-search': 'views/log-search.html',
  '/unauthorized': 'views/unauthorized.html'
};

function navigateTo(url) {
  history.pushState(null, null, url);
  loadRoute();
}

async function loadRoute() {
  const path = window.location.pathname;
  const route = routes[path] || routes['/'];
  const viewContainer = document.getElementById('view-container');

  console.log(`[router] path: ${path}`);
  console.log(`[router] route: ${route}`);
  console.log(`[router] fetching: /${route}`);

  try {
    const res = await fetch('/' + route); // ← absolute path fix
    if (!res.ok) throw new Error('Failed to fetch view: ' + route);

    const html = await res.text();
    viewContainer.innerHTML = html;

    // Load matching script module
    if (path.includes('accolades')) {
      console.log('[router] importing accolades.js');
      import('./accolades.js').then(m => m.init?.());
    } else if (path.includes('accolade')) {
      console.log('[router] importing accolade.js');
      import('./accolade.js').then(m => m.init?.());
    } else if (path.includes('events')) {
      console.log('[router] importing events.js');
      import('./events.js').then(m => m.init?.());
    } else if (path.includes('admin')) {
      console.log('[router] importing admin.js');
      import('./admin.js').then(m => m.init?.());
    } else if (path.includes('log-search')) {
      console.log('[router] importing log-search.js');
      import('./log-search.js').then(m => m.init?.());
    } else if (path === '/' || path === '/home') {
      console.log('[router] importing home.js');
      import('./home.js').then(m => m.init?.());
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
