import { PFC_CONFIG } from "./config";

function finishDiscordLogin() {
  console.log('finishDiscordLogin triggered.');

  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  console.log('Parsed code from URL:', code);

  if (!code) {
    console.log('No code found in URL — skipping login finish.');
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
      console.log('Received response:', response);
      return response.json();
    })
    .then(data => {
      console.log('Parsed response JSON:', data);
      if (data && data.token) {
        localStorage.setItem('jwt', data.token);
        console.log('✅ JWT stored:', data.token);
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
    const payload = JSON.parse(atob(token.split('.')[1]));
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
  console.log('🔒 Logged out. Reloading...');
  window.location.reload();
}

export {
  finishDiscordLogin,
  getUser,
  startDiscordLogin,
  logout
};

