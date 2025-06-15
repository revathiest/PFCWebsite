import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

// Fetch available content sections from the API and populate the dropdown.
async function loadSections() {
  const select = document.getElementById('section-select');
  const errorEl = document.getElementById('content-error');
  if (!select) return;
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/content`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Normalise potential API response shapes into an array of objects
    let items = [];
    if (Array.isArray(data.content)) {
      items = data.content;
    } else if (Array.isArray(data.contents)) {
      items = data.contents;
    } else if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      items = Object.entries(data).map(([key, val]) => ({ key, ...(val || {}) }));
    }

    const options = items
      .map(i => ({
        value: i.key || i.id || i.name,
        label: i.name || i.title || i.key || i.id
      }))
      .filter(o => o.value);

    select.innerHTML = '<option value="">Choose a section</option>' +
      options.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
  } catch (err) {
    console.error('[content-manager] Failed to load sections', err);
    if (errorEl) errorEl.textContent = 'Failed to load sections.';
  }
}

// Retrieve a section's content and populate the textarea.
async function loadContent(section) {
  const textarea = document.getElementById('content-area');
  const errorEl = document.getElementById('content-error');
  if (!textarea) return;
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/content/${section}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    textarea.value = data.content || data.value || '';
  } catch (err) {
    console.error(`[content-manager] Failed to load content for ${section}`, err);
    if (errorEl) errorEl.textContent = `Failed to load content for ${section}.`;
    textarea.value = '';
  }
}

// Save the textarea contents back to the API for a given section.
async function saveContent(section) {
  const textarea = document.getElementById('content-area');
  const errorEl = document.getElementById('content-error');
  if (!textarea) return;
  const token = localStorage.getItem('jwt');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/content/${section}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content: textarea.value })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (errorEl) errorEl.textContent = 'Content saved.';
  } catch (err) {
    console.error('[content-manager] Failed to save content', err);
    if (errorEl) errorEl.textContent = 'Failed to save content.';
  }
}

/**
 * Initialise the content manager page.
 * Binds event handlers and loads available sections.
 */
export async function init() {
  try {
    await loadSections();
    const select = document.getElementById('section-select');
    const textarea = document.getElementById('content-area');
    const saveBtn = document.getElementById('save-button');

    select?.addEventListener('change', e => {
      const value = e.target.value;
      document.getElementById('content-error').textContent = '';
      if (value) {
        loadContent(value);
        textarea?.focus();
      } else if (textarea) {
        textarea.value = '';
      }
    });

    saveBtn?.addEventListener('click', () => {
      const section = select?.value;
      if (!section) return;
      saveContent(section);
    });
  } catch (err) {
    console.error('[content-manager] init failed', err);
  }
}
