import fetchMock from 'jest-fetch-mock';

import { runIncludes } from '../src/includes.js';

beforeEach(() => {
  document.body.innerHTML = `<div data-include="nav.html"></div>`;
  fetchMock.resetMocks();
  fetchMock.mockResponse('<nav>nav</nav>');
});

test('inserts included content and dispatches nav-ready', async () => {
  const spy = jest.spyOn(document, 'dispatchEvent');
  await runIncludes();
  expect(document.body.innerHTML).toContain('<nav>nav</nav>');
  expect(spy).toHaveBeenCalled();
});
