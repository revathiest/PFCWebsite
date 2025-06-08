let allCommands = [];
let allMembers = [];
let usernameToId = {};

function fuzzyMatch(str, pattern) {
  pattern = pattern.toLowerCase();
  str = str.toLowerCase();
  let i = 0;
  for (const ch of pattern) {
    i = str.indexOf(ch, i);
    if (i === -1) return false;
    i++;
  }
  return true;
}

function updateUserDatalist(term = '') {
  const list = document.getElementById('user-options');
  list.innerHTML = allMembers
    .filter(m => fuzzyMatch(m.username, term))
    .slice(0, 25)
    .map(m => `<option value="${m.username}">`)
    .join('');
}

function updateCommandDatalist(term = '') {
  const list = document.getElementById('command-options');
  list.innerHTML = allCommands
    .filter(c => fuzzyMatch(c, term))
    .slice(0, 25)
    .map(c => `<option value="${c}">`)
    .join('');
}

async function populateFilters() {
  const token = localStorage.getItem('jwt');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const [commandsRes, membersRes] = await Promise.all([
      fetch(`${window.PFC_CONFIG.apiBase}/api/activity-log/commands`, { headers }),
      fetch(`${window.PFC_CONFIG.apiBase}/api/members`, { headers })
    ]);

    allCommands = commandsRes.ok ? await commandsRes.json() : [];
    allMembers = membersRes.ok ? await membersRes.json() : [];

    usernameToId = {};
    allMembers.forEach(m => { usernameToId[m.username] = m.userId; });

    updateCommandDatalist('');
    updateUserDatalist('');

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
  const userInput = document.getElementById('user-search');
  const userHidden = document.getElementById('userId');
  const commandInput = document.getElementById('command');

  userInput.addEventListener('input', () => {
    updateUserDatalist(userInput.value);
    userHidden.value = usernameToId[userInput.value] || '';
  });
  userInput.addEventListener('change', () => {
    userHidden.value = usernameToId[userInput.value] || '';
  });

  commandInput.addEventListener('input', () => {
    updateCommandDatalist(commandInput.value);
  });

  document.getElementById('log-search-form').addEventListener('submit', searchLogs);
});
