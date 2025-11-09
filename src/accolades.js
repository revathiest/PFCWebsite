import { PFC_CONFIG } from './config.js'
import { slugify } from './utils.js'

async function loadAccolades() {
  const container = document.getElementById('accolade-list');
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/accolades`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { accolades } = await res.json();

    container.innerHTML = accolades.map(acc => {
      const slug = slugify(acc.name);
      return `
        <a href="accolade?slug=${slug}" data-link
           class="card border-l-4 border-pfc-red p-6 rounded-xl shadow-md hover:shadow-lg transition animate-fade-in block">
          <h2 class="text-xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">
            ${acc.emoji || ''} ${acc.name}
          </h2>
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
