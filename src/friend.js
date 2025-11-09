import { PFC_CONFIG } from './config.js';

/* istanbul ignore next */
function extractUrl(str, prefix) {
  if (!str) return null;
  const regex = new RegExp(`${prefix}\\s*(https?://\\S+)`, 'i');
  const match = str.match(regex);
  return match ? match[1] : null;
}

/* istanbul ignore next */
function getSid() {
  const parts = window.location.pathname.split('/');
  return parts[2] || '';
}

function collapsibleBlock(id, title, content) {
  if (!content) return '';
  return `
    <details class="details-block mb-4">
      <summary class="details-summary cursor-pointer text-pfc-gold font-semibold underline">${title}</summary>
      <div class="details-content text-gray-300 mt-2">
        ${content}
      </div>
    </details>
  `;
}

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
    const data = await res.json();
    const wrapper = data.org || data;
    const org = wrapper.data || wrapper;

    container.innerHTML = `
      <div class="card border-l-4 border-pfc-red animate-fade-in overflow-hidden">
        <div class="h-48 bg-cover bg-center rounded-t" style="background-image: url('${org.banner}');"></div>
        <div class="px-6 py-4 text-center">
          <img src="${org.logo}" alt="${org.name} logo" class="w-24 h-24 mx-auto mb-4 rounded shadow-lg bg-black p-2" />
          <h2 class="text-3xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">${org.name}</h2>
          <div class="flex flex-wrap justify-center gap-2 text-sm mb-4">
            ${org.archetype ? `<span class="badge bg-gray-800 border border-pfc-gold">${org.archetype}</span>` : ''}
            ${org.commitment ? `<span class="badge bg-gray-800 border border-pfc-gold">${org.commitment}</span>` : ''}
            ${org.roleplay ? `<span class="badge bg-gray-800 border border-pfc-gold">Roleplay</span>` : ''}
            <span class="badge bg-gray-800 border border-pfc-gold">${org.lang || 'English'}</span>
            ${org.recruiting
              ? '<span class="badge bg-green-700 text-white border border-green-800">Recruiting</span>'
              : '<span class="badge bg-gray-800 text-gray-400 border border-gray-700">Not Recruiting</span>'}
          </div>
          <p class="text-gray-300 mb-4">${org.headline?.plaintext || ''}</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
            ${org.focus?.primary?.image ? `<div class="flex items-center gap-2">
              <img src="${org.focus.primary.image}" class="h-6 w-6" alt="Primary Focus" />
              <span>${org.focus.primary.name || ''}</span>
            </div>` : ''}
            ${org.focus?.secondary?.image ? `<div class="flex items-center gap-2">
              <img src="${org.focus.secondary.image}" class="h-6 w-6" alt="Secondary Focus" />
              <span>${org.focus.secondary.name || ''}</span>
            </div>` : ''}
            <div class="flex items-center gap-2">
              <strong>Members:</strong> ${org.members || 0}
            </div>
          </div>
          ${org.manifesto?.html ? `
            <div class="mb-6 text-left">
              <h3 class="text-xl text-pfc-gold font-semibold mb-2">Manifesto</h3>
              <div class="text-gray-300">${org.manifesto.html}</div>
            </div>
          ` : ''}
          ${collapsibleBlock('charter', 'Charter', org.charter?.html)}
          ${collapsibleBlock('history', 'History', org.history?.html)}
          <div class="mt-6">
            ${org.url ? `<a href="${org.url}" class="btn" target="_blank" rel="noopener">RSI Org Page</a>` : ''}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.details-block').forEach(details => {
      const summary = details.querySelector('.details-summary');
      if (!summary) return;
      summary.addEventListener('click', e => {
        e.preventDefault();
        details.open = !details.open;
      });
      summary.addEventListener('keypress', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          summary.click();
        }
      });
    });
  } catch (err) {
    console.error('[friend] Failed to load org:', err);
    container.innerHTML = '<p class="text-red-500">Failed to load organisation.</p>';
  }
}

export async function init() {
  await loadFriend();
}
