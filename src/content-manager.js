import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

/**
 * Fetch all content records from the API and render them for editing.
 */
async function loadContent() {
  const container = document.getElementById('content-items');
  const errorEl = document.getElementById('content-error');
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/content`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = data.content || data.contents || data;
    renderItems(Array.isArray(items) ? items : []);
  } catch (err) {
    console.error('[content-manager] Failed to load content', err);
    if (errorEl) errorEl.textContent = 'Failed to load content.';
    if (container) container.innerHTML = '';
  }
}

/**
 * Render editable fields for each content item.
 * @param {Array} items list of content records
 */
function renderItems(items) {
  const container = document.getElementById('content-items');
  if (!container) return;
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p class="text-gray-300">No content found.</p>';
    return;
  }

  container.innerHTML = items.map(item => {
    const key = item.key || item.id;
    const value = item.content || item.value || '';
    return `
      <div class="mb-4">
        <label class="block mb-1">${key}</label>
        <textarea data-key="${key}" class="w-full p-2 rounded text-black bg-gray-200">${value}</textarea>
      </div>
    `;
  }).join('');
}

/**
 * Initialiser for the content manager view.
 */
export async function init() {
  try {
    await loadContent();
    document.getElementById('save-button')?.addEventListener('click', () => {
      alert('Update endpoint not yet available.');
    });
  } catch (err) {
    console.error('[content-manager] init failed', err);
  }
}

