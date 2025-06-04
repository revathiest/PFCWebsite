# 🛰️ PFC Web App — Agents & Architecture Guide

This document outlines the architectural roles ("agents") and their responsibilities in the Pyro Freelancer Corps (PFC) web application. This is **not a static website** — it is a full-stack application with real-time elements, Discord integration, and database access.

---

## 🧠 Tech Stack Overview

| Layer        | Stack                    |
|--------------|--------------------------|
| Frontend     | [Vite](https://vitejs.dev/) + Vanilla JS / React / Astro |
| Backend      | Node.js + Express        |
| Database     | PostgreSQL (via Sequelize ORM) |
| Auth         | Discord OAuth2           |
| Hosting      | PebbleHost Web (cPanel + Git Deploy) |
| Realtime     | Discord API Webhooks / REST |
| Testing      | Jest (unit + integration) |
| Dev Workflow | Git (main/dev/feature), Prettier, ESLint |

---

## 🧩 Agents Overview

Each "agent" refers to a key component or responsibility in the system.

---

### 🖥️ `frontend-agent`

**Purpose:** Handles all UI rendering, reactive state, and communication with backend routes.

**Responsibilities:**
- Render a dynamic SPA or MPA with fast client-side interactivity
- Fetch and display POI, Scavenger Hunt, and Org data
- Handle OAuth token callback & user sessions
- Communicate with backend via REST or WebSocket

**Technologies:**
- `vite` dev server
- Either vanilla JS + HTML or React/Astro setup
- State management (context/hooks if React)

---

### 🌐 `api-agent`

**Purpose:** The primary backend interface (Express routes).

**Responsibilities:**
- REST endpoints for fetching/updating org data
- Discord bot command logging, POI submissions, event records
- Secure API key/token-based access
- OAuth2 route for Discord login

**Technologies:**
- Node.js + Express
- Discord.js REST
- Validation via `express-validator` or `zod`

---

### 🧮 `db-agent`

**Purpose:** Handles all database interaction.

**Responsibilities:**
- Schema definition via Sequelize
- POI locations, user profiles, scavenger hunt entries, roles
- Migrations & seeders
- Data validation and access control

**Technologies:**
- Sequelize ORM
- PostgreSQL
- Sequelize CLI

---

### 🤖 `discord-agent`

**Purpose:** Provides bi-directional interface with Discord (bot + API).

**Responsibilities:**
- Send messages/events from web → Discord
- Allow Discord to create content in the DB (via bot commands)
- Webhook receivers (if enabled)
- OAuth2 login and token management

**Technologies:**
- Discord.js v14+
- Discord OAuth2 flow (token + user info)
- REST API for server-side actions

---

## 🛡️ Security & Auth

- OAuth2 with Discord required for:
  - Submitting entries
  - Viewing sensitive Org data
  - Posting messages via bot
- JWT or session token issued after login
- Role-based access control (e.g., Admins, Hunters, Visitors)

---

## 🔁 Workflow

### Branching

- `main`: Live on production (PebbleHost auto-deploys this)
- `dev`: Staging / test builds
- `feature/*`: Feature branches
- `hotfix/*`: Emergency patches

### Testing

- Unit tests: Jest
- API integration tests: Supertest + mocks
- CI (optional): GitHub Actions or manual testing before merge

---

## 🚀 Deployment

1. All commits to `main` auto-deploy via PebbleHost Git integration
2. Manual deploys via `git pull` (cPanel)
3. Web root must contain:
   - `index.html`
   - Built frontend assets (`/dist`)
   - `api/` folder (if routing via Express)

---

## 🔗 Integration Points

| System         | Method         | Notes                              |
|----------------|----------------|------------------------------------|
| Discord OAuth2 | `/auth/discord` | Token, user info, scopes required  |
| Bot Sync       | Webhook + DB   | Discord bot writes to DB if needed |
| POI Data       | REST API       | Protected, admin/mod endpoints     |
| Frontend       | Fetch API      | `/api/...` routes only             |

---

## 📦 Future Roadmap

- [ ] Admin dashboard for managing POIs
- [ ] Scavenger Hunt leaderboard
- [ ] Discord bot event bridge
- [ ] Real-time DB update sync (maybe via WebSocket)

---

# 🧪 Testing Guide for PFC Web App

This guide provides instructions on how to test the PFC web application, particularly after implementing Discord authentication and protecting routes.

---

## 🔍 Testing Objectives

* Verify Discord OAuth2 flow works correctly.
* Confirm protected pages are inaccessible without authentication.
* Ensure valid sessions allow access to protected content.
* Validate backend routes with unit and integration tests.

---

## ✅ Manual Testing Steps

### 1. Discord Login Flow

* Go to `/api/auth/signin` or click your Sign In button.
* Authenticate with Discord.
* Confirm you're redirected back and see a session-aware page (e.g., user info displayed).

### 2. Protected Page Access

* Visit a protected route (e.g., `/protected`) without logging in.
* Ensure you're redirected to the sign-in page.
* Log in and revisit `/protected`.
* Ensure content loads properly and session data is displayed.

### 3. Sign Out Flow

* Click the Sign Out button.
* Try accessing `/protected` again — confirm redirection back to login.

---

## 🧪 Automated Testing

### Unit Tests (Jest)

* Location: `tests/unit/`
* Run: `npm run test`
* Coverage: Test key utilities, session logic, UI components if using React

### API Integration Tests (Supertest)

* Location: `tests/integration/`
* Focus:

  * `/api/auth` routes
  * Session persistence middleware
  * Discord OAuth token handling

#### Sample Test Example (for `/protected`):

```js
const request = require('supertest');
const app = require('../../api/index');

describe('GET /protected', () => {
  it('should redirect if not authenticated', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(302);
    expect(res.header.location).toContain('/api/auth/signin');
  });
});
```

---

## 🔁 Testing in Dev Workflow

* Run `npm run dev` to start the server with hot reload.
* Use Discord test account for repeated login/logout.
* Ensure `.env.local` is correctly set up with Discord credentials.
* Use browser DevTools to inspect cookies and session tokens.

---

## 🧰 Troubleshooting

* **Issue:** Redirect loop

  * **Fix:** Check `NEXTAUTH_URL` matches your local or prod domain.

* **Issue:** Auth state


> Built for the Pyro Freelancer Corps. Stay frosty, don't submit low-effort screenshots, and always back up your bloody database.

