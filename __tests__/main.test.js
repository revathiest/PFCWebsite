import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({ PFC_CONFIG: { debug: false } }));

// stub CSS import used by main.js

jest.mock('../src/includes.js', () => ({ runIncludes: jest.fn() }));
jest.mock('../src/nav.js', () => ({ init: jest.fn() }));
jest.mock('../src/router.js', () => ({ init: jest.fn() }));

jest.mock('../src/auth.js', () => ({
  finishDiscordLogin: jest.fn(() => Promise.resolve()),
  scheduleExpiryCheck: jest.fn()
}));

beforeEach(() => {
  jest.resetModules();
  fetchMock.resetMocks();
  const auth = require('../src/auth.js');
  auth.finishDiscordLogin.mockClear();
  auth.scheduleExpiryCheck.mockClear();
  window.history.pushState({}, '', '/');
});

async function loadMain() {
  let mods = {};
  await jest.isolateModulesAsync(async () => {
    mods.includes = require('../src/includes.js');
    mods.nav = require('../src/nav.js');
    mods.router = require('../src/router.js');
    mods.auth = require('../src/auth.js');
    require('../src/main.js');
  });
  return mods;
}

test('DOMContentLoaded initializes core modules', async () => {
  const mods = await loadMain();
  window.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 0));
  expect(mods.includes.runIncludes).toHaveBeenCalled();
  expect(mods.nav.init).toHaveBeenCalled();
  expect(mods.auth.scheduleExpiryCheck).toHaveBeenCalled();
  expect(mods.router.init).toHaveBeenCalled();
  expect(mods.auth.finishDiscordLogin).not.toHaveBeenCalled();
});

test('OAuth code triggers finishDiscordLogin', async () => {
  window.history.pushState({}, '', '/?code=123');
  const mods = await loadMain();
  window.dispatchEvent(new Event('DOMContentLoaded'));
  await new Promise(r => setTimeout(r, 0));
  expect(mods.auth.finishDiscordLogin).toHaveBeenCalled();
});
