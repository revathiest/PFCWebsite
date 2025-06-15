import { getUser } from './auth.js';

/**
 * Render a basic greeting for the authenticated admin user.
 */
function renderAdminInfo() {
  const container = document.getElementById('admin-info');
  if (!container) return;

  const user = getUser();
  if (!user) {
    container.innerHTML = '<p class="text-gray-400">Unable to load user info.</p>';
    return;
  }

  container.innerHTML = `\n    <p class="mb-4">Welcome, <strong>${user.displayName}</strong>!</p>\n    <p>Use the links below to manage the site.</p>\n  `;
}

/**
 * Entry point for the admin console page.
 */
export async function init() {
  try {
    renderAdminInfo();
  } catch (err) {
    console.error('[admin] Failed to initialise admin console', err);
  }
}

