# Arova — A Private Space for Two

Arova is a calm, warm, and secure digital sanctuary designed specifically for couples. Styled around the **Living Nebula v2** design direction, Arova provides a private visual workspace to preserve shared memories, exchange sealed digital letters, catalog reasons why you choose each other, share real-time messages, and track mutual moods and future plans.

This project is built to demonstrate modern full-stack engineering principles, separating concerns between a responsive, premium Angular SPA frontend and a robust ASP.NET Core Web API backend.

---

## 📷 Portfolio Screenshots

*Placeholder section for showcasing the Arova interface in action. Reviewers can find generated high-resolution screenshots under `visual-audit/latest/`.*

1.  **Universe Spatial Canvas (`/universe`)**: The central navigation hub containing greeting headers, couple statistics, and emotional prompts (Quiet Moments).
2.  **Planets Space Orbit Map (`/planets`)**: Dedicated solar system map displaying relationship planets with calendar-seeded daily task checklists (+50 pts).
3.  **Shared Profile view (`/profile`)**: Displays streak fires, level status, user profile badges, and a 3-column memories photo grid.
4.  **Custom Spaces Grid (`/custom-sections`)**: A dynamic custom space builder that enforces pricing tier card limits (Free: 1, Pro: 5, Platinum: 20 slots).
5.  **Sanctuary Admin Dashboard (`/admin`)**: Creator console mapping sync indicators, cloud usage meters, recent activity logs, and custom feature toggles.
6.  **Sealed Letters Vault (`/letters`)**: Locked and unlocked letter cards with countdowns and custom CSS-drawn wax seal badges.
7.  **Live Chat Room (`/chat`)**: Real-time message bubbles with SignalR status pills, online presence, and auto-growing inputs.

---

## ✨ Core Features

*   **Landing Page & Plans**: Dynamic price plan cards highlighting Free, Pro, and Platinum scopes, plus a **Gifted Plan flow** that allows users to redeem developer upgrades safely without payment input.
*   **Onboarding & Profile Setup**: A step-by-step Questionnaire, Profile Setup (with mature content age safety checks), and pairing flow where partners create or join spaces via generated couple tokens.
*   **Universe Dashboard**: A central navigation hub containing greeting headers personalized with user display names, statistics cards, and emotional prompts (Quiet Moments).
*   **Planets Space Orbit Map**: Dedicated `/planets` orbit mapping 10 relationship planets with calendar-seeded random selections and checklist tasks (+50 pts).
*   **Instagram-like Profile Grid**: Displays profile stats highlights, active rank, streak fires, and a 3-column memory photo grid.
*   **Custom Spaces & Limits**: Dynamic `/custom-sections` child route allowing custom space checklists, restricted by Pricing Tiers (Free: 1, Pro: 5, Platinum: 20 slots).
*   **20 Accents Themes**: 15 new CSS themes added for settings page palette previews.
*   **Upgraded Creator Console**: Analytical tables, feature toggles (Developer logs, slow network simulation, bypass filters), and logger event simulator.
*   **Live Chat**: Socket-driven communication with own and partner bubbles, SignalR connectivity badges, and auto-growing textareas.
*   **Memories Grid**: Responsive multi-column grid displaying categorized moments with mood emojis, favorites, and admin-only private notes.
*   **Reasons Grid**: Daily highlighted reason selection, reaction counts (Hearts, Tears, Smiles), and a dedicated overlay modal for picking a random reason.
*   **Letters Vault**: Sealed digital envelopes featuring locked/unlocked visual countdowns, category tags, and wax seal graphics.
*   **Backup & Reset**: Local data migration via JSON imports/exports, item summaries, and safety-prompt database resets.

---

## 🛠️ Tech Stack & Design System

### Frontend
*   **Core**: Angular 22 (Standalone components, signals, core routing)
*   **Styling**: SCSS (Custom theme variables and layout tokens, glassmorphic effects, responsive grids)
*   **Real-time**: ASP.NET Core SignalR Client (`@microsoft/signalr`)
*   **Testing**: Playwright E2E testing framework (Chromium, Firefox, WebKit)

### Backend
*   **Core**: ASP.NET Core Web API (.NET 10)
*   **ORM**: Entity Framework Core
*   **Database**: SQLite (Development-ready file database)
*   **Security**: JWT Authentication, CORS headers

### Design Tokens
Arova features a comprehensive styling sheet mapping theme variables directly to layout cards:
*   `--arova-bg-main`: Viewport celestial deep background.
*   `--arova-glass-blur`: 24px backdrop-blur filter.
*   `--arova-glass-bg`: Translucent card surface overlays.
*   `--arova-font-technical`: Interface layout text.

---

## ⚙️ Architecture: Local Mode vs. API Mode

Arova is uniquely engineered with a **dual-storage configuration** that allows testing without complex backend orchestrations:

1.  **Local Mode (Default)**:
    *   **Data Storage**: LocalStorage (`love-universe-data-v1` database keys).
    *   **Session Management**: Handled through browser state (`love-universe-session-v1`).
    *   **Scope**: Ideal for local showcases, reviews, and sandboxed browser sessions.
    *   **Testing Credentials**: Preset test accounts are provided:
        *   **Owner (Creator)**: `owner` / `1234`
        *   **Partner**: `partner` / `1234`
2.  **API Mode**:
    *   **Data Storage**: SQLite database synced via Entity Framework Core.
    *   **Session Management**: JWT Bearer token authentication header (`love-universe-api-token`).
    *   **Real-time Synchronization**: SignalR hubs synchronizing live chat messages.

---

## 🚀 Setup & Execution Guide

### 1. Frontend Setup (Angular)
Ensure Node.js is installed. Move to the `dd/` directory:
```bash
# Install dependencies
npm install

# Start development server
npm start
```
The application serves locally at `http://localhost:4200`.

### 2. Backend Connection Note
Ensure .NET 10 SDK is installed. Move to the backend directory:
```bash
# Run API Server
dotnet run
```
The API serves at `http://localhost:5036` (Swagger available at `http://localhost:5036/swagger`).
*Note: The frontend connects to the backend API via environment endpoints configured at `http://localhost:5036`.*

---

## 📧 API Registration & Verification Flow
Arova does not dispatch external emails/SMS in development mode. To register under API Mode:
1. Turn on API Mode in **Settings** page and click **Save**.
2. Go to `/auth`, select **Create Account**, and submit user details.
3. Upon redirection to `/verify-account`, click **Request code**.
4. Check the backend terminal console `stdout` to find the generated 6-digit verification code.

---

## 🧪 Testing and Verification Commands

Arova features automated checks covering layout checks, client logic, and data storage limits.

### Playwright E2E Integration Suite
*   **Run all tests headlessly (Chromium, Firefox, WebKit)**:
    ```bash
    npm run test:e2e
    ```
*   **Run lightweight CI tests (Chromium only)**:
    ```bash
    npm run test:e2e:ci
    ```
*   **Run interactive Playwright UI console**:
    ```bash
    npm run test:e2e:ui
    ```

### Visual Audit Screenshot Capture
*   **Generate local screenshots**:
    ```bash
    npm run visual:audit
    ```
    This script runs Chromium to crawl all 20 pages, saving them to `visual-audit/latest/`.

---

## 🔒 Security & Privacy Notes

*   **No E2EE Claim**: While Arova utilizes token-secured socket chat scoping communication to couple contexts, true End-to-End Encryption (E2EE) is classified as a future roadmap item. No false claims are made in the code or copy.
*   **No Active Integrations**: Twilio SMS gates, Stripe billing APIs, and OAuth Google/Apple modules are visually integrated but run simulated mock configurations in local environments.
*   **Sanitized Repository**: This portfolio repository contains no real credentials, SMTP passwords, private emails, or custom partner data.

---

## ⚠️ Known Limitations
*   **Offline Fallbacks**: When the ASP.NET Core backend is unreachable, Chat and API verification show warning banners. Local Mode continues functioning independently.
*   **OAuth/SMS Placeholders**: Google/Apple buttons on the authentication page show "Provider not configured" warnings, reminding reviewers that SSO is simulated. Phone registration fields are visually disabled.

---

## 🗺️ Project Status & Roadmap
*   **Current Version**: v1.2.0 (Redesign complete, 57/57 E2E tests passing).
*   **Roadmap Goals**:
    *   Real E2EE implementation using Web Crypto APIs.
    *   Active Google/Apple login provider integrations.
    *   Mobile native builds (Capacitor/Cordova) for iOS and Android.

---

## 📂 Documentation Directory

Review Arova's detailed architectural files:
*   [Stitch Handoff Design System](./DESIGN_SYSTEM.md)
*   [Visual QA Audit Scorecard](./STITCH_VISUAL_QA_REPORT.md)
*   [Browser Verification Report](./REAL_BROWSER_VISUAL_AUDIT.md)
*   [GitHub Readiness Audit](./FRONTEND_GITHUB_READINESS_AUDIT.md)
*   [Security and Scan report](./FRONTEND_PRIVACY_SCAN_REPORT.md)
*   [Screenshots Setup Guide](./SCREENSHOTS_GUIDE.md)
