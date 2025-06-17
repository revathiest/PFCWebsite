import { PFC_CONFIG } from './config.js';

// Extract the organisation sid from the current URL.
function getSid() {
  const parts = window.location.pathname.split('/');
  return parts[2] || '';
}

// Fetch organisation data and render the detail section.
async function loadFriend() {
  const sid = getSid();
  const container = document.getElementById('friend-detail');
  if (!container) return;
  if (!sid) {
    container.innerHTML = '<p class="text-red-500">Invalid organisation id.</p>';
    return;
  }
  try {
    const token = localStorage.getItem('jwt');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/orgs/${sid}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const org = await res.json();
    container.innerHTML = `
      <div class="mb-4">
        <div class="w-full h-40 bg-cover bg-center rounded" style="background-image:url('${org.banner}')"></div>
      </div>
      <img src="${org.logo}" alt="${org.name} logo" class="w-32 h-32 object-contain mx-auto mb-4" />
      <h2 class="text-3xl font-bold text-center mb-2">${org.name}</h2>
      <div class="text-gray-300 mb-4">${org.headline.html || ''}</div>
      <div class="text-left space-y-4">
        <div>${org.manifesto.html || ''}</div>
        <details><summary class="cursor-pointer">Charter</summary>${org.charter.html || ''}</details>
        <details><summary class="cursor-pointer">History</summary>${org.history.html || ''}</details>
        <p class="mt-2">Members: ${org.members}</p>
        <p>${org.recruiting ? 'Actively Recruiting' : 'Not Recruiting'}</p>
        <div class="mt-4 space-x-4">
          <a href="${org.url}" target="_blank" class="underline">RSI Org Page</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('[friend] Failed to load org:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load organisation.</p>';
  }
}

/**
 * Entry point for the friend detail page.
 * Loads the organisation info on page load.
 */
export async function init() {
  await loadFriend();
}
