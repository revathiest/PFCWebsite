
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
    const res = await fetch(`${window.PFC_CONFIG.apiBase}/api/accolades`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { accolades } = await res.json();

    const debugSlugs = accolades.map(a => ({ name: a.name, slug: window.PFCUtils.slugify(a.name) }));
    console.log('[DEBUG] Available slugs:', debugSlugs);

    const accolade = accolades.find(a => window.PFCUtils.slugify(a.name) === slug);
    if (!accolade) throw new Error(`No accolade found matching slug: ${slug}`);

    nameEl.textContent = `${accolade.emoji || ''} ${accolade.name}`;
    descEl.textContent = accolade.description || '';

    container.innerHTML = accolade.recipients.map(user => `
      <div class="bg-gray-800 p-4 rounded shadow text-left">
        <h3 class="text-xl font-bold text-white mb-1">${user.displayName}</h3>
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
