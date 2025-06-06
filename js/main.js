const apiBase = 'https://api.pyrofreelancercorps.com';

async function loadContent(sectionId) {
  try {
    console.log(`[DEBUG] Requesting: ${apiBase}/api/content/${sectionId}`);
    const res = await fetch(`${apiBase}/api/content/${sectionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`[DEBUG] Received for ${sectionId}:`, data);

    const element = document.getElementById(sectionId);
    if (!element) {
      console.warn(`[WARN] Missing element for ${sectionId}`);
      return;
    }

    if (sectionId === 'structure') {
      element.innerHTML = data.content;
    } else {
      element.textContent = data.content;
    }
  } catch (e) {
    console.error(`Failed to load ${sectionId} content:`, e);
  }
}

['about', 'structure', 'motto'].forEach(loadContent);
