// src/config.js

// Allow runtime configuration via a global object while preferring Vite env vars
const globalConfig = typeof window !== 'undefined' ? window.PFC_CONFIG || {} : {};

/**
 * Application-wide configuration settings.
 * Values come from Vite environment variables with optional global fallbacks.
 */
export const PFC_CONFIG = {
  apiBase: import.meta.env.VITE_API_BASE || globalConfig.apiBase,
  redirectUri: import.meta.env.VITE_REDIRECT_URI || globalConfig.redirectUri,
  discordClientId:
    import.meta.env.VITE_DISCORD_CLIENT_ID || globalConfig.discordClientId,
  shopifyDomain: import.meta.env.VITE_SHOPIFY_DOMAIN || globalConfig.shopifyDomain,
  shopifyStorefrontToken:
    import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || globalConfig.shopifyStorefrontToken,
  // Global debug flag to control verbose logging
  debug: (import.meta.env.VITE_DEBUG === 'true') || globalConfig.debug || false
};
