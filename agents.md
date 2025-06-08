# 🚀 PFC Web App — Static Frontend + External API Architecture

This document outlines the architecture and responsibilities of the Pyro Freelancer Corps (PFC) web application in its static-hosted form. Since PebbleHost does not support full-stack Node.js hosting, this version of the site is a **frontend-only application** that connects to an **external API** for authentication and content.

---

## 🧠 Tech Stack Overview

| Layer    | Stack                                                                                 |
| -------- | ------------------------------------------------------------------------------------- |
| Frontend | Vanilla JS / Vite / React (static build)                                              |
| API      | External ([https://api.pyrofreelancercorps.com](https://api.pyrofreelancercorps.com)) |
| Auth     | Discord OAuth2 via external endpoint                                                  |
| Hosting  | PebbleHost (static site only via cPanel)                                              |
| Realtime | Discord API Webhooks (future optional)                                                |

---

## 🧰 Architecture Roles (Agents)

### 🖥️ `frontend-agent`

**Purpose:** Handles all UI rendering, token storage, and API communication.

**Responsibilities:**

* Render interactive content based on JWT state
* Handle Discord OAuth2 redirect and send `code` to external login API
* Store JWT in localStorage and attach it to API requests

---

### 🌐 `api-gateway`

**Purpose:** External backend service hosted separately (not on PebbleHost)

**Responsibilities:**

* Accept OAuth2 `code` and `redirectUri`, issue JWT
* Authenticate JWT on all protected `/api/` routes
* Allow open access to public endpoints where JWT is not required
* Proxy and secure Discord-integrated data (POIs, profiles, org data)

**Technology:**

* Node.js + Express
* PostgreSQL (remote DB)
* Discord.js and REST integrations

---

## 🛡️ Security & Auth

* Login via Discord OAuth2 -> redirected with `?code=...`
* `auth.js` script sends `code` and `redirectUri` to external API
* API returns a JWT
* JWT stored in `localStorage`
* All future API requests include `Authorization: Bearer <token>` where required
* Some endpoints remain open and accessible without authentication

---

## 🚀 Deployment

The site is deployed directly as a static frontend via PebbleHost.

1. Upload the project root as-is:

   * `index.html`
   * `css/`, `js/`, `images/` folders
2. Ensure `index.html` is located in the web root (usually `/public_html`)
3. No build step required — all files are production-ready
4. Git or cPanel deployment supported

**Note:** PebbleHost must only host frontend assets (HTML, CSS, JS, images)

---

## 🔗 Integration Points

| System               | Method          | Notes                                                 |
| -------------------- | --------------- | ----------------------------------------------------- |
| Discord OAuth2       | Redirect + POST | Code handled via frontend, exchanged via external API |
| Protected Content    | Fetch API       | Load sections via `/api/content/:id` with JWT auth    |
| Public Content       | Fetch API       | Certain endpoints available without auth              |
| Discord Bot (future) | Webhook/API     | Optional push or sync with Discord bot                |

---

## 🔄 Development Workflow

* Work locally with Live Server or Vite dev
* Deploy only final HTML/JS/CSS files
* Keep `.env` secrets out of frontend

---

## 🔮 Testing Guide

### Manual Testing

1. Visit site and click "Login with Discord"
2. OAuth flow completes -> redirected with `?code=`
3. JWT received and stored
4. Dashboard link appears
5. Protected content loads from API
6. Public endpoints remain accessible without logging in

### Frontend Testable Areas

* JWT storage/retrieval
* API call success/failure
* UI conditional rendering based on login state
* Fallbacks for open vs protected content

---

## 📊 Future Roadmap

* [ ] Admin dashboard (frontend-only) with role-gated content
* [ ] POI submission forms with POST support
* [ ] Scavenger Hunt leaderboard (read-only)
* [ ] Optional WebSocket or long-poll update mechanism

---

> Built for the Pyro Freelancer Corps. Honour the structure, guard your tokens, and make your frontend smart enough to survive without a server.
