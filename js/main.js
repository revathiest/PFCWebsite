
async function loadContent(sectionId) {
  try {
    const url = `${window.PFC_CONFIG.apiBase}/api/content/${sectionId}`;
    console.log(`[DEBUG] Requesting: ${url}`);

    const res = await fetch(url);

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
    const contentSections = ['about', 'structure', 'motto'];
    for (const section of contentSections) {
      await loadContent(section);
    }
  } catch (err) {
    console.error('[ERROR] Failed to load site content:', err);
  }
})();
