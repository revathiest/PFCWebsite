window.PFCDiscord = {
  clientId: window.PFC_CONFIG.discordClientId,
  redirectUri: window.PFC_CONFIG.redirectUri, // Must match Discord Dev Portal

  startDiscordLogin() {
    const discordUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordUrl.searchParams.set('client_id', this.clientId);
    discordUrl.searchParams.set('redirect_uri', this.redirectUri);
    discordUrl.searchParams.set('response_type', 'code');
    discordUrl.searchParams.set('scope', 'identify');

    console.log("Redirecting to Discord auth:", discordUrl.toString());
    window.location.href = discordUrl.toString();
  },

  async finishDiscordLogin() {

    console.log("finishDiscordLogin triggered.");
    
    const code = new URLSearchParams(window.location.search).get('code');
    console.log("Parsed code from URL:", code);

    if (!code) {
      console.log("No code found in URL — skipping login finish.");
      return;
    }

    try {
      console.log("Sending POST request to exchange code...");

      const response = await fetch(`${window.PFC_CONFIG.apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: this.redirectUri })
      });

      console.log("Received response:", response);

      const data = await response.json();
      console.log("Parsed response JSON:", data);

      if (data.token) {
        localStorage.setItem('jwt', data.token);
        console.log('✅ JWT stored:', data.token);
        
        // Reload nav and view properly after login
        document.querySelector('[data-include="partials/nav.html"]')?.remove();

        const newNav = document.createElement('div');
        newNav.setAttribute('data-include', 'partials/nav.html');
        document.body.insertBefore(newNav, document.body.firstChild);

        import('./includes.js').then(() => {
          console.log('[auth] Reloaded nav after login');
          document.dispatchEvent(new Event('login-success'));
        });

        document.dispatchEvent(new Event('login-success'));

        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('❌ Login failed — no token in response:', data);
      }
    } catch (err) {
      console.error('🔥 Auth error:', err);
    }
  },

  logout() {
    localStorage.removeItem('jwt');
    console.log('🔒 Logged out and removed JWT');
    window.location.reload();
  },

  /**
   * Decode the JWT payload stored in localStorage.
   * @returns {object|null}
   */
  getUser() {
    const token = localStorage.getItem('jwt');
    if (!token) return null;
    try {
      const base64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch (err) {
      console.error('Failed to decode JWT', err);
      return null;
    }
  }
};
