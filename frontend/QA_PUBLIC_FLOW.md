# QA: Public Flow Verification & Coordinated QA Guide

This guide defines the routes, layout specifications, and credentials in Arova, followed by the testing strategy that coordinates automated Playwright tests with manual QA.

---

## 1. Route and Layout Map

Arova enforces a strict separation between public/setup routes and internal pages.

### Public and Setup Routes (No Sidebar)
These pages are standalone templates and do NOT render the main dashboard `MainLayoutComponent` sidebar.

| Route | Component / Page | Access Control |
|-------|------------------|----------------|
| `/` | LandingPageComponent | Public (Unauthenticated) |
| `/plans` | PlansPageComponent | Public (Unauthenticated) |
| `/plans/gifted` | GiftedPlanPageComponent | Public (Unauthenticated / Authenticated) |
| `/auth` | PublicAuthComponent | Public (Unauthenticated) |
| `/verify-account` | VerifyAccountComponent | Authenticated (Setup route) |
| `/onboarding/questions` | OnboardingQuestionsComponent | Authenticated (Setup route) |
| `/profile-setup` | ProfileSetupComponent | Authenticated (Setup route) |
| `/pairing-choice` | PairingChoiceComponent | Authenticated (Setup route) |

### Internal Pages (With Navigation Sidebar)
These routes render inside the internal workspace dashboard `MainLayoutComponent` with the sidebar visible.

| Route | Page | Access Control |
|-------|------|----------------|
| `/universe` | Universe Home | Authenticated & Couple Paired |
| `/planets` | Planets Space Map | Authenticated & Couple Paired |
| `/profile` | Instagram-like Profile | Authenticated & Couple Paired |
| `/custom-sections` | Custom Spaces | Authenticated & Couple Paired |
| `/memories` | Memories List | Authenticated & Couple Paired |
| `/reasons` | Reasons List | Authenticated & Couple Paired |
| `/letters` | Letters Vault | Authenticated & Couple Paired |
| `/settings` | Settings Page | Authenticated & Couple Paired |
| `/chat` | Live Chat Room | Authenticated & Couple Paired |
| `/admin` | Creator Console | Authenticated & Admin Only |

---

## 2. Local Mode Credentials

For testing Local Mode behavior, use the following preset accounts:

| Username | Passcode | Role / UI Sidebar Label |
|----------|----------|-------------------------|
| `owner` | `1234` | Partner A |
| `partner` | `1234` | Partner B |

### Storage Keys
- `love-universe-app-mode` (controls mode: `'local'` vs `'api'`)
- `love-universe-api-token` (contains JWT token in API Mode)
- `love-universe-session-v1` (holds local session details)
- `love-universe-data-v1` (main data store for memories, reasons, letters, settings, check-ins, moods, future-plans, challenges, songs)
- `arova-relationship-points-v1` (relationship points service tracking ledger, streak, and level status)
- `arova-daily-planet-state-v1` (planet service tracking active daily planet index and completed daily tasks)
- `arova-local-profile-v1` (profile details fallback storage key)
- `arova-custom-sections-v1` (custom section spaces and item checklists)
- `arova-user-tier-v1` (pricing tiers simulation)
- `arova-admin-flags-v1` (developer console feature flags)
- `arova-admin-logs-v1` (simulated logs feed)

---

## 3. Coordinated QA Strategy

We combine Playwright E2E automation with manual steps to achieve maximum test coverage.

```mermaid
graph TD
    A[QA Verification] --> B[Automated Tests (Playwright)]
    A --> C[Manual Verification]
    B --> B1[Public Flow Specs]
    B --> B2[Local Mode Specs]
    B --> B3[Placeholder Specs]
    B --> B4[Layout Layout Specs]
    C --> C1[API Registration & Email verification]
    C --> C2[Couple Pairing Flow]
    C --> C3[Live Chat WebSockets (SignalR)]
```

### What is Automated (Playwright Specs)
See details in [e2e/README.md](./e2e/README.md):
- **Public Flow**: Verifies `/`, `/plans`, `/plans/gifted`, and checks that unauthenticated requests to protected pages are redirected to `/auth`.
- **Local Mode Login**: Automates login with demo credentials for `owner` and `partner`, and checks dashboard planet page loading.
- **UI Placeholders**: Verifies Google/Apple warnings, phone verification placeholder text, disabled chat composer in Local Mode, and absence of fake E2E encryption claims.
- **Layout Logic**: Checks that the sidebar is hidden on public/setup routes and visible on internal dashboard routes.

### What Remains Manual (Backend/API Integration)
- **API Signup & SMS/Email Verification**: Because the signup verification code is sent through backend `stdout` logs for safety and local convenience, this step requires manual copy-paste.
- **Couple Pairing Flow**: Coordinating pairing between two distinct browsers manually verifies the joint API space setup.
- **SignalR Real-Time Communication**: Verifying live message dispatch between two paired users.

---

## 4. Manual Verification Steps

Follow these exact steps to complete manual signoff:

### Step 1: Start Backend & Frontend
1. Open a terminal in the backend directory and run:
   ```cmd
   dotnet run
   ```
2. Confirm API is available at `http://localhost:5036/api/health` and Swagger at `/swagger`.
3. Open a terminal in the frontend `dd/` directory and run:
   ```cmd
   npm start
   ```

### Step 2: Register & Pair Two Users
1. Go to `http://localhost:4200/auth` (User 1). Register a new account (`user1`).
2. Retrieve the code from the backend console stdout, enter it in `/verify-account` and verify.
3. Skip or answer questions, choose 18+ birthdate to ensure mature content toggle works, then click save.
4. On `/pairing-choice`, generate a code.
5. In an Incognito window, go to `http://localhost:4200/auth` (User 2) and register `user2`. Repeat verification and onboarding.
6. On `/pairing-choice`, choose "I have a partner code", input User 1's code, and click "Join couple".
7. Click "Enter Arova" on both browsers and confirm both reach `/universe`.

### Step 3: Chat Live Check
1. Navigate to `/chat` on both browsers.
2. Send messages back and forth and confirm instant delivery.
3. Check that the chat footer correctly states: *"Secure couple-scoped chat."* and does not claim true end-to-end encryption.

### Step 4: Offline Resilience Check
1. Shut down the backend API.
2. Refresh or navigate to `/plans/gifted`. Click the "Continue" button.
3. Confirm that the application handles the failure gracefully and displays:
   `Backend is not reachable. Make sure http://localhost:5036 is running.`