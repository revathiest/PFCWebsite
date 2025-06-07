// js/discordAuth.js

window.PFCDiscord = {
    clientId: '1013095667201228810',
    redirectUri: 'http://pyrofreelancercorps.com/',
  
    startDiscordLogin: function () {
      const scope = 'identify email';
      const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
      window.location.href = discordUrl;
    },
  
    exchangeCodeForToken: async function (code) {
      const res = await fetch('https://api.pyrofreelancercorps.com/api/auth/discord/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
      return await res.json();
    },
  
    getUserPermissions: async function (userId, token) {
      const res = await fetch('https://api.pyrofreelancercorps.com/api/user/permissions', {
        headers: {
          'x-user-id': userId,
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error(`Permissions fetch failed: ${res.status}`);
      return await res.json();
    },
  
    handleRedirect: async function () {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) return;
  
      try {
        const { userId, token } = await this.exchangeCodeForToken(code);
        localStorage.setItem('pfc_user', JSON.stringify({ userId, token }));
        window.history.replaceState({}, document.title, '/');
        await this.loadPermissions(userId, token);
      } catch (e) {
        console.error('Auth error:', e);
      }
    },
  
    loadPermissions: async function (userId, token) {
      const permissions = await this.getUserPermissions(userId, token);
      const dashboard = document.getElementById('dashboard-link');
      if (!dashboard) return;
      dashboard.classList.toggle('hidden', !permissions.canAccessDashboard);
    },
  
    bootstrap: async function () {
      const saved = JSON.parse(localStorage.getItem('pfc_user') || '{}');
      if (saved.userId && saved.token) {
        await this.loadPermissions(saved.userId, saved.token);
      } else {
        await this.handleRedirect();
      }
    }
  };
  
  window.addEventListener('DOMContentLoaded', () => {
    window.PFCDiscord.bootstrap();
  });
