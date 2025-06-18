import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({ PFC_CONFIG: { debug: false } }));

jest.mock('../src/auth.js', () => ({
  getUser: jest.fn(() => ({ roles: ['Member'] }))
}));

import * as router from '../src/router.js';

beforeEach(() => {
  document.body.innerHTML = '<div id="view-container"></div>';
  fetchMock.resetMocks();
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
