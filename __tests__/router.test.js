import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({ PFC_CONFIG: { debug: true } }));

jest.mock('../src/auth.js', () => ({
  getUser: jest.fn(() => ({ roles: ['Member'] }))
}));

jest.mock('../src/accolades.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/shop.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/friend.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/friends.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/officers.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/events.js', () => ({ __esModule: true, init: jest.fn() }));
jest.mock('../src/accolade.js', () => ({ __esModule: true, init: jest.fn() }));

import * as router from '../src/router.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="view-container"></div>';
  fetchMock.resetMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('navigateTo pushes history and loads route', async () => {
  fetchMock.mockResponseOnce('<div id="view-container">Home</div>');
  const spy = jest.spyOn(history, 'pushState');
  await router.navigateTo('/');
  expect(spy).toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalled();
});


test('admin route redirects when not admin', async () => {
  const { getUser } = require('../src/auth.js');
  getUser.mockResolvedValue({ roles: ['Member'] });
  fetchMock.mockResponse('<div id="view-container"></div>');
  await router.navigateTo('/admin');
  // since not admin, should fetch unauthorized view
  expect(fetchMock.mock.calls[0][0]).toContain('unauthorized');
});

test('accolades route imports script', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/accolades');
  // allow dynamic import promise to resolve
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/accolades.js');
  expect(mod.init).toHaveBeenCalled();
});

test('product route passes path to shop.init', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/product/hat');
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/shop.js');
  expect(mod.init).toHaveBeenCalledWith('/product/hat');
});

test('friend route imports module', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/friends/abc');
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/friend.js');
  expect(mod.init).toHaveBeenCalled();
});

test('friends route imports module', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/friends');
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/friends.js');
  expect(mod.init).toHaveBeenCalled();
});

test('officers route imports module', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/officers');
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/officers.js');
  expect(mod.init).toHaveBeenCalled();
});

test('events route imports module', async () => {
  fetchMock.mockResponseOnce('<div id="view-container"></div>');
  await router.navigateTo('/events');
  await new Promise(r => setTimeout(r, 0));
  const mod = require('../src/events.js');
  expect(mod.init).toHaveBeenCalled();
});

test('missing view container logs error', async () => {
  document.body.innerHTML = '';
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await router.navigateTo('/');
  expect(errSpy).toHaveBeenCalled();
  errSpy.mockRestore();
});

test('fetch failure displays error message', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  await router.navigateTo('/accolades');
  await new Promise(r => setTimeout(r, 0));
  expect(document.getElementById('view-container').textContent).toContain('Error loading');
});

test('init handles link clicks', async () => {
  fetchMock.mockResponse('<div id="view-container"></div>');
  document.body.innerHTML = '<a data-link href="/accolades">Go</a><div id="view-container"></div>';
  router.init();
  document.querySelector('a[data-link]').click();
  await new Promise(r => setTimeout(r, 0));
  expect(fetchMock).toHaveBeenCalled();
});
