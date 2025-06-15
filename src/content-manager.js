import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

async function loadSections() {
  const select = document.getElementById('section-select');
  const errorEl = document.getElementById('content-error');
  if (!select) return;
  try {
    const res = await fetch(`${PFC_CONFIG.apiBase}/api/content`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data.content) ? data.content : (Array.isArray(data.contents) ? data.contents : data);
    const options = Array.isArray(items)
      ? items.map(i => i.key || i.id).filter(Boolean)
      : [];
    select.innerHTML = '<option value="">Choose a section</option>' +
      options.map(o => `<option value="${o}">${o}</option>`).join('');
  } catch (err) {
    console.error('[content-manager] Failed to load sections', err);
    if (errorEl) errorEl.textContent = 'Failed to load sections.';
  }
}

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
