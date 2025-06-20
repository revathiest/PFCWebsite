jest.mock('../src/config.js', () => ({ PFC_CONFIG: { debug: false } }));

jest.mock('../src/auth.js', () => ({
  startDiscordLogin: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn()
}));

beforeEach(() => {
  jest.resetModules();
  const auth = require('../src/auth.js');
  auth.getUser.mockReset();
  localStorage.clear();
  document.body.innerHTML = `
    <button id="login-btn" class="hidden"></button>
    <button id="login-btn-mobile" class="hidden"></button>
    <button id="logout-btn" class="hidden"></button>
    <button id="logout-btn-mobile" class="hidden"></button>
    <p id="user-info" class="hidden">Logged in as <span id="display-name"></span></p>
    <a id="admin-link" class="hidden"></a>
    <a id="admin-link-mobile" class="hidden"></a>
    <div id="admin-container" class="hidden"></div>
    <button id="nav-toggle"></button>
    <div id="nav-menu-mobile" class="hidden"></div>
  `;
});

async function loadNav() {
  let mod;
  await jest.isolateModulesAsync(async () => {
    mod = require('../src/nav.js');
  });
  return mod;
}

test('shows admin elements when user is admin', async () => {
  localStorage.setItem('jwt', 't');
  const auth = require('../src/auth.js');
  auth.getUser.mockReturnValue({ displayName: 'Admin', roles: ['Fleet Admiral'] });
  const nav = await loadNav();
  nav.init();
  await new Promise(r => setTimeout(r, 0));
  expect(document.getElementById('admin-link').classList.contains('hidden')).toBe(false);
  expect(document.getElementById('admin-container').classList.contains('hidden')).toBe(false);
  expect(document.getElementById('login-btn').classList.contains('hidden')).toBe(true);
  expect(document.getElementById('display-name').textContent).toBe('Admin');
});

test('shows login buttons when not authenticated', async () => {
  const nav = await loadNav();
  nav.init();
  await new Promise(r => setTimeout(r, 0));
  expect(document.getElementById('login-btn').classList.contains('hidden')).toBe(false);
  expect(document.getElementById('logout-btn').classList.contains('hidden')).toBe(true);
  expect(document.getElementById('user-info').classList.contains('hidden')).toBe(true);
});

test('hamburger toggle hides and shows menu', async () => {
  await loadNav();
  document.dispatchEvent(new Event('nav-ready'));
  const menu = document.getElementById('nav-menu-mobile');
  const toggle = document.getElementById('nav-toggle');
  toggle.click();
  expect(menu.classList.contains('hidden')).toBe(false);
  toggle.click();
  expect(menu.classList.contains('hidden')).toBe(true);
});
