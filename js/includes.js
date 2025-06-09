// includes.js (non-module global version)

window.runIncludes = function runIncludes() {
    const includeElements = document.querySelectorAll('[data-include]');
    includeElements.forEach(el => {
      const file = el.getAttribute('data-include');
      if (!file) return;
  
      fetch(file)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch ${file}`);
          return res.text();
        })
        .then(content => {
          el.innerHTML = content;
          if (file.includes('nav.html')) {
            document.dispatchEvent(new Event('nav-ready'));
          }
        })
        .catch(err => {
          console.error(`[includes.js] Error loading ${file}:`, err);
        });
    });
  };
  
  // Auto-run on DOM load
  document.addEventListener('DOMContentLoaded', () => window.runIncludes());
  