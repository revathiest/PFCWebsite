window.PFCDiscord = {
  clientId: '819004565869035531',
  redirectUri: 'https://pyrofreelancercorps.com/', // Must match Discord Dev Portal

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

      const response = await fetch('https://api.pyrofreelancercorps.com/api/login', {
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

        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.error('❌ Login failed — no token in response:', data);
      }
    } catch (err) {
      console.error('🔥 Auth error:', err);
    }
  }
};
