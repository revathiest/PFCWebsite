# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Single Page Application (SPA) for the Pyro Freelancer Corps, a Star Citizen gaming organization. The site features Discord OAuth authentication, protected admin routes, and dynamic content loaded from a backend API.

## Build System & Development

### Commands

```bash
# Development server with hot reload
npm run dev

# Production build (creates dist/ directory)
npm run build

# Preview production build locally
npm preview

# Run tests (Jest with coverage)
npm test

# Build/watch Tailwind CSS
npm run build:css
npm run watch:css
```

### Build Process

- **Vite** bundles the application from `src/main.js` as entry point
- **Tailwind CSS** processes styles
- **Public Directory**: Contents of `public/` are copied to the root of `dist/` during build
- **Important**: Production paths do NOT include `/public` prefix - Vite flattens this structure

### Deployment Workflow

1. Make changes in `development` branch
2. Merge to `main` branch and push
3. GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
   - Installs dependencies
   - Runs `npm run build`
   - Copies `.htaccess` to `dist/`
   - Deploys `dist/` contents to `production` branch

**Never directly edit the `production` branch** - it's managed by the workflow.

## Architecture

### Routing System

Custom client-side router (`src/router.js`):

- Routes defined in `routes` object map paths to HTML view files
- Views are in `public/views/*.html`
- Each route has a corresponding JS module in `src/` with an `init()` function
- Protected routes (admin, log-search, content-manager) require "Fleet Admiral" role
- `.htaccess` redirects all requests to `index.html` for SPA behavior

**Critical**: `PUBLIC_BASE_PATH` in `router.js` and `includes.js` must be empty string (`''`) because Vite copies public/ contents to dist/ root.

### Page Module Pattern

Each page follows this pattern:

```javascript
// src/pagename.js
export async function init() {
  // Page initialization logic
  // Load data, bind events, etc.
}
```

The router calls `init()` after loading the HTML view. See `router.js:92-138` for the mapping logic.

### Authentication Flow

1. User clicks login → `auth.js:startDiscordLogin()` redirects to Discord OAuth
2. Discord redirects back with `?code=...` parameter
3. `main.js` detects code and calls `auth.js:finishDiscordLogin()`
4. Backend exchanges code for JWT, stored in `localStorage.getItem('jwt')`
5. JWT contains user info and roles (decoded client-side)
6. `auth.js:scheduleExpiryCheck()` sets timer to auto-logout on JWT expiry
7. Navigation module (`nav.js`) shows/hides UI elements based on auth state

### Event System

Custom events coordinate between modules:

- `nav-ready`: Fired when navigation HTML is loaded (by `includes.js` and `router.js`)
- `login-success`: Fired after successful OAuth login (by `auth.js`)
- Both trigger `nav.js:runNavLogic()` to update UI

### Configuration

Two-tier config system:

1. **Runtime config** (`public/config.js`): Sets `window.PFC_CONFIG` with production values
2. **Source config** (`src/config.js`): Reads from Vite env vars or falls back to `window.PFC_CONFIG`

Environment variables:
- `VITE_API_BASE` - Backend API URL
- `VITE_REDIRECT_URI` - OAuth redirect URI (must match Discord app config exactly, including trailing slash)
- `VITE_DISCORD_CLIENT_ID` - Discord OAuth client ID
- `VITE_DEBUG` - Enable debug logging (`"true"` string)

### HTML Includes

The `includes.js` module provides a simple include system:

```html
<div data-include="./partials/nav.html"></div>
```

Includes are loaded via fetch and injected into the DOM. The nav.html include fires the `nav-ready` event.

## Testing

- **Framework**: Jest with jsdom environment
- **Location**: `__tests__/` directory
- **Mocks**: `__mocks__/` directory
- **Setup**: `jest.setup.js` configures fetch mocks
- **Coverage**: Enabled by default, reports to `coverage/`

Run specific test file (example):
```bash
npx jest __tests__/router.test.js
```

## Key Files

- `src/main.js` - Application entry point, orchestrates initialization
- `src/router.js` - Client-side routing, route protection
- `src/auth.js` - Discord OAuth, JWT handling, session management
- `src/nav.js` - Navigation UI updates based on auth state
- `src/includes.js` - HTML include system
- `src/config.js` - Configuration management
- `public/config.js` - Production runtime configuration
- `index.html` - SPA shell, loads config and main.js

## Common Patterns

### Adding a New Page

1. Create view HTML in `public/views/newpage.html`
2. Create module in `src/newpage.js` with `export async function init() { ... }`
3. Add route to `routes` object in `src/router.js` (line 7)
4. Add import logic to `router.js:loadPageModule()` function (line 92)
5. If protected, add to `protectedRoutes` array (line 21)

### Path References

In source files (src/):
- Use relative imports: `import { x } from './utils.js'`
- Reference config: `PFC_CONFIG.apiBase`

In HTML files (public/):
- Images: `/images/...` (NOT `/public/images/...`)
- Views: `views/...` (loaded by router)
- Partials: `./partials/...` (loaded by includes)

### API Integration

All API calls use `PFC_CONFIG.apiBase`:

```javascript
const res = await fetch(`${PFC_CONFIG.apiBase}/api/endpoint`);
```

For authenticated endpoints, include JWT:

```javascript
const token = localStorage.getItem('jwt');
const res = await fetch(`${PFC_CONFIG.apiBase}/api/endpoint`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Styling

- **Framework**: Tailwind CSS
- **Custom Colors**: `pfc-red` (#87021b), `pfc-gold` (#b59f3b)
- **Configuration**: `tailwind.config.js`
- **Content Paths**: Scans `index.html`, `public/**/*.html`, `src/**/*.js`

Card component pattern:
```html
<div class="card">...</div>
```

Gradient text pattern:
```html
<h1 class="bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">
```

## Troubleshooting

### Pages showing empty
- Check browser console for fetch errors
- Verify `PUBLIC_BASE_PATH = ''` in router.js and includes.js
- Ensure views are in `public/views/` directory
- Check that router's `loadPageModule()` includes the page

### Auth not working
- Verify `discordClientId` in `public/config.js`
- Ensure `redirectUri` matches Discord app config exactly (including trailing slash)
- Check JWT is stored: `localStorage.getItem('jwt')`
- Look for `[auth]` prefixed console messages when debug is enabled

### Nav not appearing
- Check for `[nav]` console errors
- Verify `public/partials/nav.html` exists
- Ensure `nav-ready` event is firing
- Check includes.js is loaded and running

### Build issues
- Clear `dist/` and `node_modules/`, reinstall: `rm -rf node_modules package-lock.json && npm install`
- Verify `.htaccess` is copied to dist/ after build
- Check Vite config (`vite.config.js`) has correct base path (`./`)
