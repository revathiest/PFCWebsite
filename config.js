// public/config.js
// Frontend runtime configuration for static hosting scenarios.
// Edit the values below to point the SPA at the correct API and OAuth settings.

window.PFC_CONFIG = Object.assign(
  {
    apiBase: 'https://api.pyrofreelancercorps.com',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
    discordClientId: '819004565869035531',
    debug: false
  },
  window.PFC_CONFIG || {}
);
