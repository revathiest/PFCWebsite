import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: { apiBase: 'https://api', debug: false }
}));

import { init } from '../src/accolade.js';

beforeEach(() => {
  fetchMock.resetMocks();
  document.body.innerHTML = '<div id="accolade-name"></div><div id="accolade-description"></div><div id="recipients"></div>';
});

test('init populates accolade details', async () => {
  const data = {
    accolades: [{ name: 'Medal', emoji: '🏆', description: 'desc', recipients: [{ displayName: 'Alice' }] }]
  };
  fetchMock.mockResponseOnce(JSON.stringify(data));
  window.history.pushState({}, '', '/accolade?slug=medal');
  await init();
  expect(document.getElementById('accolade-name').textContent).toContain('Medal');
  expect(document.getElementById('accolade-description').textContent).toBe('desc');
  expect(document.getElementById('recipients').innerHTML).toContain('Alice');
});

test('init handles fetch failure', async () => {
  fetchMock.mockRejectOnce(new Error('fail'));
  window.history.pushState({}, '', '/accolade?slug=medal');
  await init();
  expect(document.getElementById('accolade-name').textContent).toBe('Error');
  expect(document.getElementById('accolade-description').textContent).toContain('Failed');
});
