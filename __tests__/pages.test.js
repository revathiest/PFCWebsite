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
import * as changelog from '../src/changelog.js';
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

// init() fetches known-versions and the default changelog in parallel;
// this routes each URL to its own canned response so both calls resolve
// sensibly regardless of which fires first.
function mockChangelogFetches({ versions = [], changelogResponse } = {}) {
  fetchMock.mockResponse(req => {
    if (req.url.includes('known-versions')) {
      return Promise.resolve(JSON.stringify({ versions }));
    }
    return Promise.resolve(JSON.stringify(changelogResponse));
  });
}

test('changelog.init handles empty list', async () => {
  mockChangelogFetches({ changelogResponse: { versionFrom: null, versionTo: null, entries: [] } });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();
  expect(document.getElementById('changelog-results').innerHTML).toContain('No changelog data');
});

test('changelog.init renders grouped entries', async () => {
  mockChangelogFetches({
    changelogResponse: {
      versionFrom: 'sc-alpha-4.8.0',
      versionTo: 'sc-alpha-4.9.0',
      entries: [
        {
          category: 'ships',
          recordRef: 'ref-1',
          recordName: 'Avenger Titan',
          fieldKey: 'insurance_expedite_fee',
          label: 'Insurance Expedite Fee',
          unit: 'aUEC',
          oldValue: '2343',
          newValue: '9999'
        },
        {
          category: 'ships',
          recordRef: 'ref-1',
          recordName: 'Avenger Titan',
          fieldKey: 'crew_size',
          label: 'Crew Size',
          unit: null,
          oldValue: '1',
          newValue: '2'
        }
      ]
    }
  });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();
  const html = document.getElementById('changelog-results').innerHTML;
  expect(html).toContain('Avenger Titan');
  expect(html).toContain('Insurance Expedite Fee');
  expect(html).toContain('Crew Size');
  expect(html).toContain('sc-alpha-4.8.0');
});

test('changelog.init renders one always-visible row per item with all its changes consolidated', async () => {
  mockChangelogFetches({
    changelogResponse: {
      versionFrom: 'v1',
      versionTo: 'v2',
      entries: [
        {
          category: 'ships',
          recordRef: 'ref-1',
          recordName: 'Avenger Titan',
          fieldKey: 'insurance_expedite_fee',
          label: 'Insurance Expedite Fee',
          unit: 'aUEC',
          oldValue: '2343',
          newValue: '9999'
        },
        {
          category: 'ships',
          recordRef: 'ref-1',
          recordName: 'Avenger Titan',
          fieldKey: 'crew_size',
          label: 'Crew Size',
          unit: null,
          oldValue: '1',
          newValue: '2'
        }
      ]
    }
  });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();

  const results = document.getElementById('changelog-results');
  // no accordion controls — the table is the whole UI, nothing to click
  expect(results.querySelector('.accordion-toggle')).toBeNull();

  const rows = results.querySelectorAll('tbody tr');
  expect(rows.length).toBe(1); // one row for the one record, not one per field
  expect(rows[0].textContent).toContain('Avenger Titan');
  expect(rows[0].textContent).toContain('Insurance Expedite Fee');
  expect(rows[0].textContent).toContain('Crew Size');
});

test('changelog.init renders added/removed fields as a dash, not the word null', async () => {
  mockChangelogFetches({
    changelogResponse: {
      versionFrom: 'sc-alpha-4.8.0',
      versionTo: 'sc-alpha-4.9.0',
      entries: [
        {
          category: 'weapons',
          recordRef: 'ref-new',
          recordName: 'New Weapon',
          fieldKey: 'ammo_capacity',
          label: 'Ammo Capacity',
          unit: 'rounds',
          oldValue: null,
          newValue: '5220'
        },
        {
          category: 'weapons',
          recordRef: 'ref-old',
          recordName: 'Old Weapon',
          fieldKey: 'ammo_capacity',
          label: 'Ammo Capacity',
          unit: 'rounds',
          oldValue: '3660',
          newValue: null
        }
      ]
    }
  });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();
  const html = document.getElementById('changelog-results').innerHTML;
  expect(html).toContain('New Weapon');
  expect(html).toContain('Old Weapon');
  expect(html).not.toMatch(/>null</);
  expect(html.match(/N\/A/g)?.length).toBe(2);
});

test('changelog.init handles fetch failure', async () => {
  fetchMock.mockReject(new Error('fail'));
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();
  expect(document.getElementById('changelog-results').innerHTML).toContain('Failed to load changelog');
});

test('changelog.init hides the picker when fewer than two versions are known', async () => {
  mockChangelogFetches({ versions: ['only-one'], changelogResponse: { versionFrom: null, versionTo: null, entries: [] } });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();
  expect(document.getElementById('changelog-picker').innerHTML).toBe('');
});

test('changelog.init renders a version picker and re-fetches on Compare', async () => {
  mockChangelogFetches({
    versions: ['v1', 'v2', 'v3'],
    changelogResponse: { versionFrom: 'v2', versionTo: 'v3', entries: [] }
  });
  document.body.innerHTML = '<div id="changelog"></div>';
  await changelog.init();

  const fromSelect = document.getElementById('changelog-from');
  const toSelect = document.getElementById('changelog-to');
  expect(fromSelect.value).toBe('v2'); // defaults to the latest pair
  expect(toSelect.value).toBe('v3');

  fetchMock.mockClear();
  mockChangelogFetches({
    versions: ['v1', 'v2', 'v3'],
    changelogResponse: {
      versionFrom: 'v1',
      versionTo: 'v3',
      entries: [{
        category: 'ships', recordRef: 'ref-1', recordName: 'Avenger Titan',
        fieldKey: 'crew_size', label: 'Crew Size', unit: null, oldValue: '1', newValue: '3'
      }]
    }
  });
  fromSelect.value = 'v1';
  toSelect.value = 'v3';
  document.getElementById('changelog-compare').click();
  await new Promise(r => setTimeout(r, 0));

  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('from=v1'));
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('to=v3'));
  expect(document.getElementById('changelog-results').innerHTML).toContain('Avenger Titan');
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

