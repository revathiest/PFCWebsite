import { PFC_CONFIG } from './config.js';

/**
 * Fetch the list of officers from the API and render them.
 */
async function loadOfficers() {
  const container = document.getElementById('officer-list');
  if (!container) return;

  const token = localStorage.getItem('jwt');
  if (!token) {
    container.innerHTML = '<p class="text-gray-300">Please log in to view officers.</p>';
    return;
  }

  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/officers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const officers = Array.isArray(data.officers) ? data.officers : [];

    if (officers.length === 0) {
      container.innerHTML = '<p class="text-gray-300">No officer data available.</p>';
      return;
    }

    container.innerHTML = officers.map(officer => {
      const roleColor = officer.color || '#fff';
      const bio = officer.bio && officer.bio.trim()
        ? `<p class="text-gray-300 mt-2">${officer.bio}</p>`
        : '<p class="text-gray-500 italic mt-2">No biography available.</p>';
      return `
        <div class="card">
          <h3 style="color: ${roleColor};">${officer.displayName}</h3>
          <p class="font-semibold" style="color: ${roleColor};">${officer.role}</p>
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
