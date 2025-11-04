// src/config.js

// Allow runtime configuration via a global object while preferring Vite env vars
const globalConfig = typeof window !== 'undefined' ? window.PFC_CONFIG || {} : {};

// Support Jest or Node environments where import.meta may not be available
let env = {};
try {
  env = (0, eval)('import.meta.env');
} catch {
  try{
    env = process.env;
  } catch (err){
    console.log('Unable to process .env');
  }
}

/**
 * Application-wide configuration settings.
 * Values come from Vite environment variables with optional global fallbacks.
 */
export const PFC_CONFIG = {
  apiBase: env.VITE_API_BASE || globalConfig.apiBase,
  redirectUri: env.VITE_REDIRECT_URI || globalConfig.redirectUri,
  discordClientId: env.VITE_DISCORD_CLIENT_ID || globalConfig.discordClientId,
  // Global debug flag to control verbose logging
  debug: (env.VITE_DEBUG === 'true') || globalConfig.debug || false
};
