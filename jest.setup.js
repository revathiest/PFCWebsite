import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// public/config.js normally sets this before any page module loads (via a
// <script> tag); Jest never loads it, so give home.js's direct
// `window.PFC_CONFIG.debug` read something to find instead of crashing.
window.PFC_CONFIG = window.PFC_CONFIG || {};
