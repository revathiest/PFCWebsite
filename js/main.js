const apiBase = 'https://api.pyrofreelancercorps.com';

async function loadContent(sectionId, token) {
  try {
    const url = `${apiBase}/api/content/${sectionId}`;
    console.log(`[DEBUG] Requesting: ${url}`);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`API call failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log(`[DEBUG] Received for ${sectionId}:`, data);

    const target = document.getElementById(sectionId);
    if (!target) {
      console.warn(`[WARN] Element #${sectionId} not found.`);
      return;
    }

    if (sectionId === 'structure') {
      target.innerHTML = data.content;
    } else {
      target.textContent = data.content;
    }
  } catch (err) {
    console.error(`[ERROR] Could not load content for "${sectionId}":`, err);
  }
}

(async function () {
  try {
    const token = await window.PFCAuth.getApiToken(apiBase);
    if (!token) {
      console.warn('[WARN] No JWT found. Skipping authenticated content load.');
      return;
    }

    const contentSections = ['about', 'structure', 'motto'];
    for (const section of contentSections) {
      await loadContent(section, token);
    }
  } catch (err) {
    console.error('[ERROR] Failed to initialise authenticated content loader:', err);
  }
})();
