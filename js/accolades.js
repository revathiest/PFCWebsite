const apiBase = 'https://api.pyrofreelancercorps.com';

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

async function loadAccolades(token) {
  const container = document.getElementById('accolade-list');
  try {
    const res = await fetch(`${apiBase}/api/accolades`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { accolades } = await res.json();

    container.innerHTML = accolades.map(acc => {
      const slug = slugify(acc.name);
      return `
        <a href="accolade.html?slug=${slug}" class="block bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-bold text-pfc-red mb-2">${acc.emoji || ''} ${acc.name}</h2>
          <p class="text-gray-300 text-sm">${acc.description || 'No description available.'}</p>
        </a>
      `;
    }).join('');
  } catch (err) {
    console.error('[ERROR] Failed to load accolades:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load accolades.</p>';
  }
}

(async function () {
  const token = await window.PFCAuth.getApiToken(apiBase);
  loadAccolades(token);
})();
