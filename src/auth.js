import { PFC_CONFIG } from './config.js';

const DEBUG = PFC_CONFIG.debug;

/**
 * Decode a JWT and return its payload.
 *
 * @param {string} token - JWT string
 * @returns {object} Decoded payload
 */
function decodeJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}

/**
 * Set a timeout to automatically log out when the JWT expires.
 */
function scheduleExpiryCheck() {
  const token = localStorage.getItem('jwt');
  if (!token) return;

  try {
    const payload = decodeJwt(token);
    if (!payload.exp) return;
    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
    } else {
      setTimeout(logout, msUntilExpiry);
    }
  } catch (err) {
    console.warn('[auth] Failed to schedule expiry check:', err);
  }
}

function finishDiscordLogin() {
  if (DEBUG) console.log('finishDiscordLogin triggered.');

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (DEBUG) console.log('Parsed code from URL:', code);

  if (!code) {
    if (DEBUG) console.log('No code found in URL — skipping login finish.');
    return;
  }

  fetch(`${PFC_CONFIG.apiBase}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirectUri: PFC_CONFIG.redirectUri
    })
  })
    .then(response => {
      if (DEBUG) console.log('Received response:', response);
      return response.json();
    })
    .then(data => {
      if (DEBUG) console.log('Parsed response JSON:', data);
      if (data && data.token) {
        localStorage.setItem('jwt', data.token);
        if (DEBUG) console.log('✅ JWT stored:', data.token);
        scheduleExpiryCheck();
        document.dispatchEvent(new Event('login-success'));
      } else {
        console.warn('[auth] No token received from API:', data);
      }
      window.location.href = PFC_CONFIG.redirectUri;
    })
    .catch(err => {
      console.error('❌ Error finishing Discord login:', err);
    });
  }

function getUser() {
  try {
    const token = localStorage.getItem('jwt');
    if (!token || token === 'undefined') return null;
    const payload = decodeJwt(token);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logout();
      return null;
    }
    return payload;
  } catch (err) {
    console.warn('[auth] Failed to decode JWT:', err);
    return null;
  }
}

function startDiscordLogin() {
  const clientId = PFC_CONFIG?.discordClientId;
  const redirectUri = PFC_CONFIG?.redirectUri;


  if (!clientId) {
    console.error('[auth] Missing Discord Client ID in PFC_CONFIG');
    return;
  }

  const url = `https://discord.com/oauth2/authorize?response_type=code&client_id=${clientId}&scope=identify+guilds.members.read&redirect_uri=${redirectUri}`;
  window.location.href = url;
}

function logout() {
  localStorage.removeItem('jwt');
  if (DEBUG) console.log('🔒 Logged out. Reloading...');
  window.location.reload();
}

export {
  finishDiscordLogin,
  getUser,
  startDiscordLogin,
  logout,
  scheduleExpiryCheck
};

