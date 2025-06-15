export const PFC_CONFIG = {
  apiBase: import.meta.env.VITE_API_BASE,
  redirectUri: import.meta.env.VITE_REDIRECT_URI,
  discordClientId: import.meta.env.VITE_DISCORD_CLIENT_ID,
  // Global debug flag to control verbose logging
  debug: import.meta.env.VITE_DEBUG === 'true'
};
