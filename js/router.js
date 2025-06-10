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

  try {
    const res = await fetch(route);
    if (!res.ok) throw new Error('Failed to fetch view: ' + route);
    const html = await res.text();
    viewContainer.innerHTML = html;

    // Trigger any page-specific scripts after load
    if (path.includes('accolades')) {
      import('./accolades.js').then(m => m.init?.());
    } else if (path.includes('accolade')) {
      import('./accolade.js').then(m => m.init?.());
    } else if (path.includes('events')) {
        import('./events.js').then(m => m.init?.());
    } else if (path.includes('admin')) {
        import('./admin.js').then(m => m.init?.());
    } else if (path.includes('log-search')) {
        import('./log-search.js').then(m => m.init?.());
    } else if (path === '/' || path === '/home') {
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
