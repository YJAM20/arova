# Arova Playwright E2E Testing & Manual QA Documentation

This directory contains automated end-to-end (E2E) smoke tests for **Arova — A private space for two.** using [Playwright](https://playwright.dev/).

---

## 1. Automated Test Suites

The automated tests are designed to cover public routes, setup routes, local demo credentials, UI placeholders, and layout logic.

### Configured Test Specs

1. **[public-flow.spec.ts](./e2e/public-flow.spec.ts)**
   - Verifies the landing page `/` content and brand copy.
   - Verifies the plans page `/plans` rendering and plan option counts.
   - Verifies the gifted plan page `/plans/gifted` does not render payment inputs and blocks unauthenticated upgrades.
   - Asserts unauthenticated redirects of protected routes back to `/auth`.

2. **[local-mode.spec.ts](./e2e/local-mode.spec.ts)**
   - Logs in using Local Demo Mode credentials for both `owner` and `partner` accounts.
   - Asserts navigation to the main dashboard `/universe` and verifies role-specific welcome text.
   - Navigates through internal dashboard pages (`/memories`, `/reasons`, `/letters`, `/chat`, `/settings`) confirming successful rendering.

3. **[api-placeholders.spec.ts](./e2e/api-placeholders.spec.ts)**
   - Verifies the warning popup when clicking Google or Apple buttons on `/auth`.
   - Verifies the phone verification warning placeholder on the Phone tab of `/verify-account`.
   - Verifies that `/chat` in Local Mode disables input elements and displays the warning "Chat requires API Mode."
   - Ensures no false E2E encryption claims are made.

4. **[navigation-layout.spec.ts](./e2e/navigation-layout.spec.ts)**
   - Asserts that public and setup pages (`/`, `/plans`, `/plans/gifted`, `/auth`, `/verify-account`, `/onboarding/questions`, `/profile-setup`, `/pairing-choice`) do NOT render the main dashboard navigation sidebar.
   - Asserts that internal routes (`/universe`, `/memories`, `/reasons`, `/letters`, `/settings`, `/chat`) DO render the sidebar layout.

5. **[planets.spec.ts](./e2e/planets.spec.ts)**
   - Verifies the planets space map loading and interactions with the daily checklist.

6. **[profile.spec.ts](./e2e/profile.spec.ts)**
   - Verifies the Instagram-like memory grid, preview modals, and user profile edit details, checking that the sidebar updates immediately.

7. **[custom-sections.spec.ts](./e2e/custom-sections.spec.ts)**
   - Simulates different plan tiers (Free, Pro, Platinum) and verifies slot constraints, custom section creation, and checklist tasks.

---

## 2. Command Line Scripts

You can execute the automated test suites using the following npm scripts in Windows PowerShell or Command Prompt:

* **Run tests headlessly (Standard Windows command)**:
  ```powershell
  npm.cmd run test:e2e
  ```
* **Run tests in headed mode**:
  ```powershell
  npm.cmd run test:e2e:headed
  ```
* **Run tests in Playwright interactive UI mode**:
  ```powershell
  npm.cmd run test:e2e:ui
  ```

> [!IMPORTANT]
> To run the E2E tests locally, ensure the Angular development server is running at `http://localhost:4200` beforehand (`npm start` or `npm.cmd run start`).

---

## 3. Manual QA Testing Guide

Some scenarios cannot be fully automated due to external requirements or local development limits:

### Why API Email Verification remains Manual
Full API registration and couple pairing require capturing a **6-digit verification code** that the ASP.NET Core backend prints directly to its standard output console (`stdout`). Because the code is only output locally to the terminal hosting the API, Playwright cannot natively read it. Thus, API mode onboarding verification must be done manually.

### Steps for Manual Verification

#### A. Clean Environment
1. Open DevTools in your browser and run `localStorage.clear()` to clean cached states.
2. Start the backend: `dotnet run` (from the backend directory).
3. Verify the API is healthy by navigating to `http://localhost:5036/api/health` and checking Swagger at `http://localhost:5036/swagger`.
4. Start the frontend: `npm.cmd run start` (from the `dd/` directory).

#### B. User 1 Registration & Onboarding
1. Go to `http://localhost:4200/auth`.
2. Click **Create Account** tab and fill in details (e.g. username: `alice`, dob: 18+, language: `en`).
3. Upon redirection to `/verify-account`, click **Request code**.
4. Check the backend console output, copy the 6-digit code, enter it in the form, and click **Verify**.
5. Answer or skip the quick onboarding questions on `/onboarding/questions`.
6. Complete your profile setup on `/profile-setup` (enabling mature content if desired).
7. Select **Create a code for my partner** on `/pairing-choice` and click **Generate partner code**. Note down the code.

#### C. User 2 Joining
1. Open an Incognito/Private browser window and navigate to `http://localhost:4200/auth`.
2. Register a second account (e.g. `bob`). Verify using the new verification code from the backend console.
3. On `/pairing-choice`, select **I have a partner code** and enter the code generated by Alice.
4. Click **Join couple** and then **Enter Arova**. Both windows will now show the dashboard sidebar and Couple Profile.

---

## 4. Offline / Resilience Verification

To verify the app's friendly response to network and backend failures:
1. Kill the backend console process (Ctrl+C).
2. Attempt to sign in on `/auth` in API mode or apply a gifted plan.
3. Assert that a clear, friendly error banner is shown stating:
   `Backend is not reachable. Make sure http://localhost:5036 is running.`

