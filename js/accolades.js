

async function loadAccolades() {
  const container = document.getElementById('accolade-list');
  try {
    const res = await fetch(`${window.PFC_CONFIG.apiBase}/api/accolades`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { accolades } = await res.json();

    container.innerHTML = accolades.map(acc => {
      const slug = window.PFCUtils.slugify(acc.name);
      return `
        <a href="views/accolade.html?slug=${slug}" data-link class="block bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
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

export async function init() {
  try {
    await loadAccolades();
  } catch (err) {
    console.error('[ERROR] Failed to load site content:', err);
  }
}
