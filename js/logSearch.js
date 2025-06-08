let allCommands = [];
let allMembers = [];

async function populateFilters() {
  const token = localStorage.getItem('jwt');
  if (!token) return;

  const headers = {
    Authorization: `Bearer ${token}`
  };

  try {
    const [commandsRes, membersRes] = await Promise.all([
      fetch(`${window.PFC_CONFIG.apiBase}/api/commands`, { headers }),
      fetch(`${window.PFC_CONFIG.apiBase}/api/members`, { headers })
    ]);

    if (!commandsRes.ok) {
      const text = await commandsRes.text();
      console.error('Command fetch failed:', commandsRes.status, text);
      throw new Error('Failed to load commands');
    }

    if (!membersRes.ok) {
      const text = await membersRes.text();
      console.error('Member fetch failed:', membersRes.status, text);
      throw new Error('Failed to load members');
    }

    const contentTypeC = commandsRes.headers.get('content-type') || '';
    const contentTypeM = membersRes.headers.get('content-type') || '';

    const allCommands = contentTypeC.includes('application/json')
      ? (await commandsRes.json()).commands || []
      : (() => { console.error('Commands response not JSON:', contentTypeC); return []; })();

      const allMembers = contentTypeM.includes('application/json')
      ? ((await membersRes.json()).members || []).sort((a, b) =>
          (a.displayName || '').localeCompare(b.displayName || '')
        )
      : (() => { console.error('Members response not JSON:', contentTypeM); return []; })();   

    const commandSelect = document.getElementById('command');
    commandSelect.innerHTML = '<option value="">Any</option>' +
      allCommands.map(cmd => `<option value="${cmd}">${cmd}</option>`).join('');

    const userSelect = document.getElementById('userId');
    userSelect.innerHTML = '<option value="">Any</option>' +
      allMembers.map(m => `<option value="${m.userId}">${m.displayName}</option>`).join('');

    const typeSelect = document.getElementById('type');
    typeSelect.innerHTML = '<option value="">Any</option>' +
      ['LOGIN', 'COMMAND_EXECUTION'].map(t => `<option value="${t}">${t}</option>`).join('');
  } catch (err) {
    console.error('Failed to populate filters:', err);
  }
}

function renderResults(logs = []) {
  const container = document.getElementById('results');
  if (!Array.isArray(logs) || logs.length === 0) {
    container.innerHTML = '<p class="text-gray-300">No results found.</p>';
    return;
  }

  container.innerHTML = logs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const type = log.interaction_type?.toUpperCase() || log.event_type?.toUpperCase() || 'UNKNOWN';
    const user = log.displayName || log.memberName || log.user_id;
    const location = log.channelName ? `in #${log.channelName}` : '';
    const command = log.command_name ? `used /${log.command_name}` : '';
    const message = log.message_content?.trim() ? `— "${log.message_content}"` : '';
    const summary = [user, command || message, location, `@ ${timestamp}`].filter(Boolean).join(' ');

    return `
      <div class="p-2 bg-gray-800 rounded shadow text-sm">
        <div><strong>[${type}]</strong> ${summary}</div>
      </div>
    `;
  }).join('');
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
