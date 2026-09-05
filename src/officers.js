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

    // Officers are ordered by their Discord role's hierarchy position (higher
    // position = more senior), so renaming officer roles in Discord doesn't
    // require any changes here.
    const sortedOfficers = officers
      .filter(o => o.roleName)
      .sort((a, b) => (b.rolePosition ?? -1) - (a.rolePosition ?? -1));

    if (sortedOfficers.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No officer data available.</p>';
      return;
    }

    container.classList.add('flex', 'flex-col', 'gap-6');

    container.innerHTML = sortedOfficers.map(officer => {
      const role = officer.roleName;
      const color = officer.roleColor || '#fff';
      const bio = officer.bio && officer.bio.trim()
        ? `<p class="text-gray-300 mt-2">${officer.bio}</p>`
        : '<p class="text-gray-500 italic mt-2">No biography available.</p>';

      return `
        <div class="card border-l-4 animate-fade-in" style="border-color: ${color};">
          <h3 class="text-2xl font-bold mb-1" style="color: ${color};">${officer.displayName}</h3>
          <p class="font-semibold text-sm uppercase tracking-wide mb-2" style="color: ${color};">${role}</p>
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
