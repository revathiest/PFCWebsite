// Example configuration file.
// Copy to `src/config.js` or use Vite environment variables.
// Required env vars:
//   VITE_API_BASE - base URL for the external API
//   VITE_REDIRECT_URI - OAuth redirect URL of this site
//   VITE_DISCORD_CLIENT_ID - Discord OAuth client ID
//   VITE_SHOPIFY_DOMAIN - Shopify store domain (e.g. "example.myshopify.com")
//   VITE_SHOPIFY_STOREFRONT_TOKEN - Shopify storefront API token
window.PFC_CONFIG = {
  apiBase: "https://api.example.com",
  redirectUri: "https://yourdomain.com/index.html",
  discordClientId: "YOUR_DISCORD_CLIENT_ID",
  shopifyDomain: "example.myshopify.com",
  shopifyStorefrontToken: "STOREFRONT_TOKEN",
  debug: false
};
