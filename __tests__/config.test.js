test('PFC_CONFIG reads from global object', () => {
  global.PFC_CONFIG = { apiBase: 'a' };
  const { PFC_CONFIG: cfg } = require('../src/config.js');
  expect(cfg.apiBase).toBe('a');
});
