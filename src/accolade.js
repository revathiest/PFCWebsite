import { PFC_CONFIG } from './config.js'
import { slugify } from './utils.js'

const DEBUG = PFC_CONFIG.debug;

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

async function loadAccoladePage() {
  const slug = getSlug();
  const nameEl = document.getElementById('accolade-name');
  const descEl = document.getElementById('accolade-description');
  const container = document.getElementById('recipients');

  if (!slug) {
    nameEl.textContent = 'Error';
    descEl.textContent = 'Missing slug parameter in URL.';
    return;
  }

  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/accolades`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { accolades } = await res.json();

    const debugSlugs = accolades.map(a => ({ name: a.name, slug: slugify(a.name) }));
    if (DEBUG) console.log('[DEBUG] Available slugs:', debugSlugs);

    const accolade = accolades.find(a => slugify(a.name) === slug);
    if (!accolade) throw new Error(`No accolade found matching slug: ${slug}`);

    nameEl.innerHTML = `<span class="bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent font-bold text-3xl">${accolade.emoji || ''} ${accolade.name}</span>`;
    descEl.textContent = accolade.description || '';

    container.classList.add('flex', 'flex-col', 'gap-6');
    container.innerHTML = accolade.recipients.map(user => `
      <div class="card border-l-4 border-pfc-red animate-fade-in">
        <h3 class="text-xl font-bold mb-1 text-white">${user.displayName}</h3>
      </div>
    `).join('');
  } catch (err) {
    console.error('[ERROR] Failed to load accolade:', err);
    nameEl.textContent = 'Error';
    descEl.textContent = `Failed to load accolade information. ${err.message}`;
  }
}

export async function init() {
  try {
    await new Promise(resolve => requestAnimationFrame(resolve));
    await loadAccoladePage();
  } catch (err) {
    console.error('[ERROR] Failed to load site content:', err);
  }
}
