import '../src/nav.js';

jest.mock('../src/auth.js', () => ({
  startDiscordLogin: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn(() => ({ displayName: 'Tester', roles: ['Fleet Admiral'] }))
}));

beforeEach(() => {
  document.body.innerHTML = `
    <button id="login-btn" class="hidden"></button>
    <button id="login-btn-mobile" class="hidden"></button>
    <button id="logout-btn" class="hidden"></button>
    <button id="logout-btn-mobile" class="hidden"></button>
    <span id="display-name"></span>
    <div id="user-info" class="hidden"></div>
    <a id="admin-link" class="hidden"></a>
    <a id="admin-link-mobile" class="hidden"></a>
    <div id="admin-container" class="hidden"></div>
  `;
  window.dispatchEvent(new Event('nav-ready'));
});

test('shows user info when logged in as admin', () => {
  const info = document.getElementById('user-info');
  expect(info.classList.contains('hidden')).toBe(false);
  expect(document.getElementById('display-name').textContent).toBe('Tester');
});
