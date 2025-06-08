async function populateFilters() {
  const token = localStorage.getItem('jwt');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const [commandsRes, membersRes] = await Promise.all([
      fetch(`${window.PFC_CONFIG.apiBase}/api/commands`, { headers }),
      fetch(`${window.PFC_CONFIG.apiBase}/api/members`, { headers })
    ]);

    const commands = commandsRes.ok ? await commandsRes.json() : [];
    const members = membersRes.ok ? await membersRes.json() : [];

    const commandSelect = document.getElementById('command');
    commandSelect.innerHTML = '<option value="">Any</option>' +
      commands.map(c => `<option value="${c}">${c}</option>`).join('');

    const userSelect = document.getElementById('userId');
    userSelect.innerHTML = '<option value="">Any</option>' +
      members.map(m => `<option value="${m.userId}">${m.username}</option>`).join('');

    const typeSelect = document.getElementById('type');
    typeSelect.innerHTML = '<option value="">Any</option>' +
      ['LOGIN','COMMAND_EXECUTION'].map(t => `<option value="${t}">${t}</option>`).join('');
  } catch (err) {
    console.error('Failed to populate filters', err);
  }
}

function renderResults(logs = []) {
  const container = document.getElementById('results');
  if (!Array.isArray(logs) || logs.length === 0) {
    container.innerHTML = '<p class="text-gray-300">No results found.</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="card">
      <h3>${log.type} - ${log.userId}</h3>
      <p class="text-sm">${log.timestamp || ''}</p>
      <p>${log.command || ''}</p>
      <p>${log.message || ''}</p>
    </div>
  `).join('');
}

async function searchLogs(e) {
  e.preventDefault();
  const token = localStorage.getItem('jwt');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const params = new URLSearchParams();
  const type = document.getElementById('type').value;
  const userId = document.getElementById('userId').value;
  const command = document.getElementById('command').value;
  const message = document.getElementById('message').value;

  if (type) params.set('type', type);
  if (userId) params.set('userId', userId);
  if (command) params.set('command', command);
  if (message) params.set('message', message);

  const url = `${window.PFC_CONFIG.apiBase}/api/activity-log/search?${params.toString()}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderResults(data.logs || data.results || []);
  } catch (err) {
    console.error('Search failed', err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const user = PFCDiscord.getUser();
  const token = localStorage.getItem('jwt');
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('Server Admin');

  if (!token || !isAdmin) {
    window.location.href = '../index.html';
    return;
  }

  document.getElementById('logout-btn')?.classList.remove('hidden');
  const nameEl = document.getElementById('display-name');
  if (nameEl) {
    nameEl.textContent = user.displayName;
    nameEl.classList.remove('hidden');
  }

  await populateFilters();
  document.getElementById('log-search-form').addEventListener('submit', searchLogs);
});
