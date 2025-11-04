import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: {
    apiBase: 'https://api',
    redirectUri: '/home',
    discordClientId: '123',
    debug: false
  }
}));

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});

// --- auth.js ---
test('getUser clears token when expired', () => {
  const auth = require('../src/auth.js');
  const payload = { exp: Math.floor(Date.now()/1000) - 10 };
  const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
  localStorage.setItem('jwt', token);
  expect(auth.getUser()).toBeNull();
  expect(localStorage.getItem('jwt')).toBeNull();
});

test('scheduleExpiryCheck removes expired token immediately', () => {
  jest.useFakeTimers();
  const auth = require('../src/auth.js');
  const payload = { exp: Math.floor(Date.now()/1000) - 1 };
  const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
  localStorage.setItem('jwt', token);
  auth.scheduleExpiryCheck();
  jest.runAllTimers();
  expect(localStorage.getItem('jwt')).toBeNull();
  jest.useRealTimers();
});

test('getUser handles malformed token', () => {
  const auth = require('../src/auth.js');
  localStorage.setItem('jwt', 'bad.token');
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  expect(auth.getUser()).toBeNull();
  expect(warnSpy).toHaveBeenCalled();
  warnSpy.mockRestore();
});

// --- content-manager.js ---
import { loadSections, loadContent } from '../src/content-manager.js';

test('loadSections supports object response', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ about: {}, motto: {} }));
  document.body.innerHTML = '<select id="section-select"></select><div id="content-error"></div>';
  await loadSections();
  const opts = document.querySelectorAll('#section-select option');
  expect(opts.length).toBe(3); // default + two sections
});

test('loadContent populates editor', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ content: '<p>Hi</p>' }));
  document.body.innerHTML = '<div id="content-editor"></div><div id="content-error"></div>';
  await loadContent('about');
  expect(document.getElementById('content-editor').innerHTML).toBe('<p>Hi</p>');
});

test('loadContent handles fetch error', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<div id="content-editor"></div><div id="content-error"></div>';
  await loadContent('about');
  expect(document.getElementById('content-error').textContent).toContain('Failed');
});

test('loadSections handles fetch error', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<select id="section-select"></select><div id="content-error"></div>';
  await loadSections();
  expect(document.getElementById('content-error').textContent).toContain('Failed');
});

test('saveContent handles error', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<div id="content-editor">x</div><div id="content-error"></div>';
  const { saveContent } = require('../src/content-manager.js');
  await saveContent('about');
  expect(document.getElementById('content-error').textContent).toContain('Failed');
});


// --- editor.js ---
import { initEditor } from '../src/editor.js';

test('initEditor handles toolbar clicks', () => {
  document.body.innerHTML = '<div id="ed" contenteditable></div><input id="col"/><div id="tb"><button data-cmd="bold"></button></div>';
  document.execCommand = jest.fn();
  initEditor('ed','col','tb');
  document.querySelector('[data-cmd]').click();
  expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
});

// --- friend.js ---
import { init as friendInit } from '../src/friend.js';

test('friend.init renders collapsible blocks and toggles', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ data: { sid:'X', name:'Org', banner:'', logo:'', members:1, charter:{html:'c'}, history:{html:'h'} } }));
  document.body.innerHTML = '<div id="friend-detail"></div>';
  window.history.pushState({}, '', '/friends/X');
  await friendInit();
  const summary = document.querySelector('#collapsible-charter .details-summary');
  summary.click();
  expect(document.querySelector('#collapsible-charter').open).toBe(true);
});

test('friend.init shows error on fetch failure', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<div id="friend-detail"></div>';
  window.history.pushState({}, '', '/friends/X');
  await friendInit();
  expect(document.getElementById('friend-detail').textContent).toContain('Failed');
});

// --- home.js ---
import { init as homeInit } from '../src/home.js';

test('home.init warns when section element missing', async () => {
  fetchMock.mockResponse(JSON.stringify({ content: 'x' }));
  document.body.innerHTML = '<div id="about"></div><div id="motto"></div>';
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await homeInit();
  expect(warnSpy).toHaveBeenCalled();
  expect(document.getElementById('about').textContent).toBe('x');
  warnSpy.mockRestore();
});

// --- log-search.js ---
import { searchLogs } from '../src/log-search.js';

test('searchLogs builds query and renders results', async () => {
  const log = { timestamp: Date.now(), user_id: 'u', command_name: 'c' };
  fetchMock.mockResponseOnce(JSON.stringify({ logs: [log] }));
  localStorage.setItem('jwt', 't');
  document.body.innerHTML = '<input id="type"/><input id="userId"/><input id="command"/><input id="message"/><div id="results"></div>';
  document.getElementById('type').value = 'join';
  document.getElementById('userId').value = 'u';
  document.getElementById('command').value = 'c';
  document.getElementById('message').value = 'hello';
  await searchLogs();
  expect(fetchMock.mock.calls[0][0]).toContain('type=join');
  expect(document.getElementById('results').innerHTML).toContain('c');
});

test('searchLogs logs error on failure', async () => {
  fetchMock.mockResponseOnce('', { status: 500 });
  localStorage.setItem('jwt', 't');
  document.body.innerHTML = '<input id="type"/><input id="userId"/><input id="command"/><input id="message"/><div id="results"></div>';
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await searchLogs();
  expect(errSpy).toHaveBeenCalled();
  errSpy.mockRestore();
});

test('logSearch.init handles fetch rejection', async () => {
  fetchMock.mockReject(new Error('fail'));
  localStorage.setItem('jwt', 't');
  document.body.innerHTML = '<select id="command"></select><select id="userId"></select><select id="type"></select><div id="results"></div><button id="search-button"></button>';
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await require('../src/log-search.js').init();
  expect(errSpy).toHaveBeenCalled();
  errSpy.mockRestore();
});

// --- officers.js ---
import { init as officersInit } from '../src/officers.js';

test('officers.init shows error on fetch failure', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  document.body.innerHTML = '<div id="officer-list"></div>';
  await officersInit();
  expect(document.getElementById('officer-list').innerHTML).toContain('Failed');
});

