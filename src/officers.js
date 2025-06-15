import { PFC_CONFIG } from './config.js';

/**
 * Fetch the list of officers from the API and render them.
 * This endpoint is now public and requires no JWT.
 */
async function loadOfficers() {
  const container = document.getElementById('officer-list');
  if (!container) return;



  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/officers`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const officers = Array.isArray(data.officers) ? data.officers : [];

    const RANK_ORDER = [
      'Fleet Admiral',
      'Admiral',
      'Commodore',
      'Captain',
      'Commander'
    ];

    const sortedOfficers = officers
      .filter(o => {
        const role = o.roleName;
        return RANK_ORDER.includes(role);
      })
      .sort((a, b) => {
        const roleA = a.roleName;
        const roleB = b.roleName;
        return RANK_ORDER.indexOf(roleA) - RANK_ORDER.indexOf(roleB);
      });

    if (sortedOfficers.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No officer data available.</p>';
      return;
    }

    container.innerHTML = sortedOfficers.map(officer => {
      const roleObj = officer.roleName || {};
      const roleName = typeof roleObj === 'string' ? roleObj : roleObj.roleName;
      const roleColor = officer.roleColor || roleObj.roleColor || '#fff';
      const bio = officer.bio && officer.bio.trim()
        ? `<p class="text-gray-300 mt-2">${officer.bio}</p>`
        : '<p class="text-gray-500 italic mt-2">No biography available.</p>';

      return `
        <div class="card">
          <h3 style="color: ${roleColor};">${officer.displayName}</h3>
          <p class="font-semibold" style="color: ${roleColor};">${roleName ?? ''}</p>
          ${bio}
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('[officers] Failed to load officers:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load officer data.</p>';
  }
}

/**
 * Initialise the officers view.
 */
export async function init() {
  await loadOfficers();
}
