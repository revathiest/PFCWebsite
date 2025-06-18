import fetchMock from 'jest-fetch-mock';

jest.mock('../src/config.js', () => ({
  PFC_CONFIG: { apiBase: 'https://api', redirectUri: '', debug: false }
}));


describe('getUser', () => {
  test('returns decoded payload when token valid', () => {
    const auth = require('../src/auth.js');
    const payload = { displayName: 'Test', exp: Math.floor(Date.now()/1000)+100 };
    const token = 'header.' + btoa(JSON.stringify(payload)) + '.sig';
    localStorage.setItem('jwt', token);
    expect(auth.getUser()).toEqual(payload);
  });

});

describe('scheduleExpiryCheck', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('sets timeout for future expiry', () => {
    const auth = require('../src/auth.js');
    const payload = { exp: Math.floor(Date.now()/1000)+1 };
    const token = 'h.' + btoa(JSON.stringify(payload)) + '.s';
    localStorage.setItem('jwt', token);
    const spy = jest.spyOn(global, 'setTimeout');
    auth.scheduleExpiryCheck();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});



