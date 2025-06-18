import { PFC_CONFIG } from './config.js';

function extractUrl(str, prefix) {
  if (!str) return null;
  const regex = new RegExp(`${prefix}\\s*(https?://\\S+)`, 'i');
  const match = str.match(regex);
  return match ? match[1] : null;
}

function getSid() {
  const parts = window.location.pathname.split('/');
  return parts[2] || '';
}

// Helper to build a collapsible block using native <details> for reliability
function collapsibleBlock(id, title, content) {
  if (!content) return '';
  return `
    <details class="details-block mb-4" id="collapsible-${id}">
      <summary class="details-summary cursor-pointer">${title}</summary>
      <div class="details-content">
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
      <div class="relative shadow-xl rounded-xl overflow-hidden bg-base-900 border border-base-700">
        <div class="h-48 bg-cover bg-center" style="background-image: url('${org.banner}');"></div>
        <div class="relative px-8 -mt-12 flex flex-col items-center">
          <img src="${org.logo}" alt="${org.name} logo"
               class="w-32 h-32 object-contain shadow-lg bg-base-900" />
          <h2 class="text-3xl font-bold mt-4 mb-2 text-accent-300">${org.name}</h2>
          <div class="flex flex-wrap gap-2 mb-4">
            ${org.archetype ? `<span class="badge bg-base-800 border border-accent-800">${org.archetype}</span>` : ''}
            ${org.commitment ? `<span class="badge bg-base-800 border border-primary-600">${org.commitment}</span>` : ''}
            ${org.roleplay ? `<span class="badge bg-base-800 border border-pink-700">Roleplay</span>` : ''}
            <span class="badge bg-base-800 border border-base-700">${org.lang || 'English'}</span>
            ${org.recruiting
              ? '<span class="badge bg-green-700 text-green-200 border border-green-800">Recruiting</span>'
              : '<span class="badge bg-gray-800 text-gray-400 border border-base-700">Not Recruiting</span>'}
          </div>
          <div class="text-base-300 text-center mb-6">
            ${org.headline?.html || ''}
          </div>
        </div>
        <div class="px-8 pb-8">
          <div class="flex flex-wrap gap-4 justify-center mb-4">
            ${org.focus?.primary?.image ? `<div class="flex items-center gap-2">
              <img src="${org.focus.primary.image}" class="h-6 w-6" alt="Primary Focus" />
              <span>${org.focus.primary.name || ''}</span>
            </div>` : ''}
            ${org.focus?.secondary?.image ? `<div class="flex items-center gap-2">
              <img src="${org.focus.secondary.image}" class="h-6 w-6" alt="Secondary Focus" />
              <span>${org.focus.secondary.name || ''}</span>
            </div>` : ''}
            <div class="flex items-center gap-2">
              <span class="font-semibold">Members:</span> ${org.members || 0}
            </div>
          </div>
          ${org.manifesto?.html ? `
            <div class="mb-4">
              <h3 class="font-bold text-accent-400 mb-2">Manifesto</h3>
              <div class="prose prose-invert">${org.manifesto.html}</div>
            </div>
          ` : ''}
          ${collapsibleBlock('charter', 'Charter', org.charter?.html)}
          ${collapsibleBlock('history', 'History', org.history?.html)}
          <div class="mt-8 flex flex-wrap gap-4 items-center">
            ${org.url ? `<a href="${org.url}" class="button" target="_blank" rel="noopener">RSI Org Page</a>` : ''}
          </div>
        </div>
      </div>
    `;

    // Manually attach toggle handlers for details in case <details> is not
    // natively supported or another style prevents default toggling
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
