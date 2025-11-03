import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: { apiBase: 'https://api', debug: false }
}));

const mockGetUser = jest.fn();
jest.mock('../src/auth.js', () => ({
  getUser: () => mockGetUser()
}));

import * as home from '../src/home.js';
import * as events from '../src/events.js';
import * as accolades from '../src/accolades.js';
import * as accolade from '../src/accolade.js';
import * as officers from '../src/officers.js';
import * as friends from '../src/friends.js';
import * as friend from '../src/friend.js';
import * as admin from '../src/admin.js';
import * as contentManager from '../src/content-manager.js';
import * as logSearch from '../src/log-search.js';
import * as unauthorized from '../src/unauthorized.js';

beforeEach(() => {
  fetchMock.resetMocks();
  document.body.innerHTML = '<div id="view-container"></div>';
});

test('home.init fetches sections', async () => {
  fetchMock.mockResponse(JSON.stringify({ content: 'ok' }));
  document.body.innerHTML = '<div id="about"></div><div id="structure"></div><div id="motto"></div>';
  await home.init();
  expect(fetchMock.mock.calls.length).toBe(3);
});

test('events.init handles empty list', async () => {
  fetchMock.mockResponse(JSON.stringify({ events: [] }));
  document.body.innerHTML = '<div id="events"></div>';
  await events.init();
  expect(document.getElementById('events').innerHTML).toContain('No upcoming');
});

test('accolades.init renders list', async () => {
  fetchMock.mockResponse(JSON.stringify({ accolades: [{ name: 'Medal' }] }));
  document.body.innerHTML = '<div id="accolade-list"></div>';
  await accolades.init();
  expect(document.getElementById('accolade-list').innerHTML).toContain('Medal');
});

test('accolade.init missing slug shows error', async () => {
  fetchMock.mockResponse(JSON.stringify({ accolades: [] }));
  document.body.innerHTML = '<div id="accolade-name"></div><div id="accolade-description"></div><div id="recipients"></div>';
  window.history.pushState({}, '', '/accolades');
  await accolade.init();
  expect(document.getElementById('accolade-name').textContent).toBe('Error');
});

test('officers.init displays message when none', async () => {
  fetchMock.mockResponse(JSON.stringify({ officers: [] }));
  document.body.innerHTML = '<div id="officer-list"></div>';
  await officers.init();
  expect(document.getElementById('officer-list').innerHTML).toContain('No officer');
});

test('friends.init handles empty list', async () => {
  fetchMock.mockResponse(JSON.stringify({ orgs: [] }));
  document.body.innerHTML = '<div id="friends-grid"></div>';
  await friends.init();
  expect(document.getElementById('friends-grid').innerHTML).toContain('No organisations');
});

test('friend.init invalid id shows error', async () => {
  document.body.innerHTML = '<div id="friend-detail"></div>';
  window.history.pushState({}, '', '/friends/');
  await friend.init();
  expect(document.getElementById('friend-detail').innerHTML).toContain('Invalid');
});

test('admin.init renders with user', () => {
  mockGetUser.mockReturnValue({ displayName: 'T' });
  document.body.innerHTML = '<div id="admin-info"></div>';
  admin.init();
  expect(document.getElementById('admin-info').textContent).toContain('Welcome');
});

test('contentManager.init loads entries', async () => {
  fetchMock.mockResponse(JSON.stringify({ entries: [] }));
  document.body.innerHTML = '<select id="section-select"></select><div id="content-error"></div><div id="content-editor"></div><button id="save-button"></button>';
  await contentManager.init();
  expect(fetchMock).toHaveBeenCalled();
});

test('logSearch.init loads logs', async () => {
  fetchMock.mockResponse(JSON.stringify({ items: [] }));
  localStorage.setItem('jwt', 'token');
  document.body.innerHTML = '<select id="command"></select><select id="userId"></select><select id="type"></select><div id="results"></div><button id="search-button"></button>';
  await logSearch.init();
  expect(fetchMock).toHaveBeenCalled();
});

test('unauthorized.init attaches handler', () => {
  document.body.innerHTML = '<a data-link></a>';
  unauthorized.init();
  const link = document.querySelector('a[data-link]');
  expect(link).toBeTruthy();
});

test('events.init renders list with event', async () => {
  fetchMock.mockResponse(JSON.stringify({ events: [{ name: 'Party', start_time: Date.now(), end_time: Date.now() }] }));
  document.body.innerHTML = '<div id="events"></div>';
  await events.init();
  expect(document.getElementById('events').innerHTML).toContain('Party');
});

test('friends.init renders organisation list', async () => {
  fetchMock.mockResponse(JSON.stringify({ orgs: [{ sid: 'ABC', name: 'Alpha', headline: { plaintext: 'hello' }, members: 3 }] }));
  document.body.innerHTML = '<div id="friends-grid"></div>';
  await friends.init();
  expect(document.getElementById('friends-grid').innerHTML).toContain('Alpha');
});

test('friend.init loads detail', async () => {
  fetchMock.mockResponse(JSON.stringify({ data: { sid: 'ABC', name: 'Alpha', banner: '', logo: '', members: 1 } }));
  document.body.innerHTML = '<div id="friend-detail"></div>';
  window.history.pushState({}, '', '/friends/ABC');
  await friend.init();
  expect(document.getElementById('friend-detail').innerHTML).toContain('Alpha');
});

