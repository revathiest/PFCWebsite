import { PFC_CONFIG } from './config.js';

/**
 * Render friend organisations as cards in a responsive grid.
 */
async function loadFriends() {
  const container = document.getElementById('friends-grid');
  if (!container) return;
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/orgs`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { orgs } = await res.json();
    if (!Array.isArray(orgs) || orgs.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No organisations found.</p>';
      return;
    }

    container.innerHTML = orgs.map(org => {
      const recruiting = org.recruiting ? '<span class="badge ml-2">Recruiting</span>' : '';
      return `
        <div class="card flex flex-col items-center text-center">
          <div class="w-full h-32 bg-cover bg-center mb-4 rounded" style="background-image:url('${org.banner}')"></div>
          <img src="${org.logo}" alt="${org.name} logo" class="w-24 h-24 object-contain mb-2" />
          <h3 class="text-xl font-bold">${org.name}</h3>
          <p class="text-sm text-gray-300 mb-2">${org.headline.plaintext || ''}</p>
          <p class="text-sm mb-2">Members: ${org.members}${recruiting}</p>
          <a data-link href="/friends/${org.sid}" class="button mt-auto">Learn More</a>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[friends] Failed to load orgs:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load organisations.</p>';
  }
}

export async function init() {
  await loadFriends();
}
