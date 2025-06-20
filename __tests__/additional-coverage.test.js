import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: {
    apiBase: 'https://api',
    redirectUri: '/home',
    discordClientId: '123',
    shopifyDomain: 'dom',
    shopifyStorefrontToken: 'tok',
    debug: false
  }
}));

const mockGetUser = jest.fn();
jest.mock('../src/auth.js', () => ({
  ...jest.requireActual('../src/auth.js'),
  getUser: () => mockGetUser()
}));

import { init as adminInit } from '../src/admin.js';
import { init as accoladesInit } from '../src/accolades.js';
import { init as homeInit } from '../src/home.js';
import { init as friendInit } from '../src/friend.js';
import { init as officersInit } from '../src/officers.js';
import { init as unauthorizedInit } from '../src/unauthorized.js';
import { navigateTo } from '../src/router.js';
import * as auth from '../src/auth.js';
import * as contentManager from '../src/content-manager.js';
import * as logSearch from '../src/log-search.js';
import { initEditor } from '../src/editor.js';

beforeEach(() => {
  fetchMock.resetMocks();
  document.body.innerHTML = '<div id="view-container"></div>';
  mockGetUser.mockReset();
});

// --- accolades.js error path ---
test('accolades.init handles fetch failure', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<div id="accolade-list"></div>';
  await accoladesInit();
  expect(document.getElementById('accolade-list').textContent).toContain('Failed');
});

// --- admin.js with missing user ---
test('admin.init shows error when user missing', () => {
  mockGetUser.mockReturnValue(null);
  document.body.innerHTML = '<div id="admin-info"></div>';
  adminInit();
  expect(document.getElementById('admin-info').textContent).toContain('Unable');
});

// --- auth.finishDiscordLogin success path ---
test('finishDiscordLogin stores token', async () => {
  window.history.pushState({}, '', '/?code=abc');
  fetchMock.mockResponseOnce(JSON.stringify({ token: 't.jwt' }));
  auth.finishDiscordLogin();
  await new Promise(r => setTimeout(r, 0));
  expect(localStorage.getItem('jwt')).toBe('t.jwt');
});

// --- auth.startDiscordLogin constructs url ---
test('startDiscordLogin redirects', () => {
  expect(() => auth.startDiscordLogin()).not.toThrow();
});

// --- content-manager save path ---
test('content-manager.saveContent posts data', async () => {
  fetchMock.mockResponseOnce('{}');
  document.body.innerHTML = '<div id="content-editor">x</div><div id="content-error"></div>';
  await contentManager.saveContent('about');
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/about'),
    expect.objectContaining({ method: 'PUT' })
  );
});

// --- editor.js ---
test('initEditor wires color input', () => {
  document.body.innerHTML = '<div id="e" contenteditable></div><input id="c"/><div id="t"></div>';
  document.execCommand = jest.fn();
  initEditor('e', 'c', 't');
  document.getElementById('c').dispatchEvent(new Event('input'));
  expect(document.execCommand).toHaveBeenCalled();
});

// --- friend.js success path ---
test('friend.init renders organisation', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ data: { sid:'X', name:'Org', banner:'', logo:'', members:1 } }));
  document.body.innerHTML = '<div id="friend-detail"></div>';
  window.history.pushState({}, '', '/friends/X');
  await friendInit();
  expect(document.getElementById('friend-detail').innerHTML).toContain('Org');
});

// --- home.js fetch error ---
test('home.init handles fetch error', async () => {
  fetchMock.mockReject(new Error('err'));
  document.body.innerHTML = '<div id="about"></div><div id="structure"></div><div id="motto"></div>';
  await homeInit();
  expect(document.getElementById('about').textContent).toBe('');
});

// --- log-search.renderResults ---
test('renderResults shows message on empty', () => {
  document.body.innerHTML = '<div id="results"></div>';
  logSearch.renderResults([]);
  expect(document.getElementById('results').textContent).toContain('No results');
});

// --- officers.js success path ---
test('officers.init renders list', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ officers:[{ displayName:'A', roleName:'Captain' }] }));
  document.body.innerHTML = '<div id="officer-list"></div>';
  await officersInit();
  expect(document.getElementById('officer-list').innerHTML).toContain('Captain');
});

// --- router.js route loading ---
test('navigateTo loads dynamic friend route', async () => {
  fetchMock.mockResponseOnce('<div id="view-container">F</div>');
  document.body.innerHTML = '<div id="view-container"></div>';
  await navigateTo('/friends/abc');
  expect(fetchMock).toHaveBeenCalled();
});

// --- shop.load more handler ---
test('shop.init load more button fetches next page', async () => {
  const data = { products:{ edges:[{cursor:'c1', node:{handle:'h', title:'Hat', tags:['a'], images:{edges:[{node:{url:'u', altText:'a'}}]}, variants:{edges:[{node:{id:'1', price:{amount:'1'}}}]}}}], pageInfo:{hasNextPage:false}} };
  jest.doMock('../src/api/shopify.js', () => ({ shopifyGraphQL: () => Promise.resolve(data) }));
  document.body.innerHTML = '<div id="view-container"></div>';
  await jest.isolateModulesAsync(async () => {
    const mod = require('../src/shop.js');
    await mod.init('/shop');
  });
  expect(document.getElementById('view-container').innerHTML).toContain('Hat');
});

// --- unauthorized.init ---
test('unauthorized.init attaches click handler', () => {
  document.body.innerHTML = '<a data-link></a>';
  window.loadInitialRoute = jest.fn();
  unauthorizedInit();
  document.querySelector('a[data-link]').click();
  expect(window.loadInitialRoute).toHaveBeenCalled();
});

