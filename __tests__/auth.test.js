import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: { apiBase: 'https://api', redirectUri: 'https://site', debug: false }
}));

import * as auth from '../src/auth.js';

describe('getUser', () => {
  test('returns decoded payload when token valid', () => {
    const payload = { displayName: 'Test', exp: Math.floor(Date.now()/1000)+100 };
    const token = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
    localStorage.setItem('jwt', token);
    expect(auth.getUser()).toEqual(payload);
  });

  test('returns null when expired and clears token', () => {
    const payload = { exp: Math.floor(Date.now()/1000)-10 };
    const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
    localStorage.setItem('jwt', token);
    const spy = jest.spyOn(auth, 'logout').mockImplementation(() => {});
    expect(auth.getUser()).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('scheduleExpiryCheck', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('sets timeout for future expiry', () => {
    const payload = { exp: Math.floor(Date.now()/1000)+1 };
    const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
    localStorage.setItem('jwt', token);
    const spy = jest.spyOn(global, 'setTimeout');
    auth.scheduleExpiryCheck();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('finishDiscordLogin', () => {
  test('stores token and dispatches event', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ token: 'abc' }));
    delete window.location;
    window.location = { search: '?code=123', href: 'https://site' };
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');
    await auth.finishDiscordLogin();
    expect(localStorage.getItem('jwt')).toBe('abc');
    expect(dispatchSpy).toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });
});

describe('logout', () => {
  test('clears storage and reloads', () => {
    localStorage.setItem('jwt', 'x');
    delete window.location;
    window.location = { reload: jest.fn() };
    auth.logout();
    expect(localStorage.getItem('jwt')).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
