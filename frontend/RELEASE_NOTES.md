# Arova Portfolio Release Notes (v1.2.0-preview)

Arova is a calm, intimate digital sanctuary designed for two. This document details the portfolio preview release of Arova’s Angular SPA frontend.

---

## 1. Capabilities & Key Features
*   **Living Nebula v2 Visual Redesign**: Twinkling background mesh with theme-scoping gradients.
*   **Dual-mode storage (Local vs API)**: Complete client state machine that runs client-side in Local Mode (`owner` / `partner` demo accounts) or pairs dynamically over JWT in API Mode.
*   **Custom Space limits**: `/custom-sections` slots count progress tracking that restricts lists checks based on user subscription tiers (Free: 1, Pro: 5, Platinum: 20 slots).
*   **Constellation of Care (`/reasons`)**: Heart/Tear/Smile counts, random picks, and highlights.
*   **Wax-sealed letters (`/letters`)**: Locked and unlocked letter triggers with visual countdown timers.
*   **Creator Console (`/admin`)**: Cloud storage stats, sync rates, simulation switches, and debug checks.
*   **Sensory themes settings**: Swatch grid displaying 20 themes.

---

## 2. Testing & Visual Audit Suite
Arova includes a regression testing pipeline to prevent visual degradation and ensure frontend stability:
*   **E2E Smoke Tests**: 57/57 tests covering router, local storage persistence, forms, and mode placeholders.
*   **Headless Visual Auditing**: Custom screenshot crawler that verifies 20 paths, outputting to `visual-audit/latest/`.

---

## 3. Local Verification Guide
To run and verify Arova locally:
1.  **Start Development Server**:
    ```bash
    npm run start
    ```
2.  **Execute Integration Tests**:
    ```bash
    npm run test:e2e
    ```
3.  **Run Visual Audit**:
    ```bash
    npm run visual:audit
    ```

---

## 4. Known Sandbox Limits (Mock Behaviors)
The portfolio build integrates simulated flows for elements that require active merchant account bindings:
*   **SSO Buttons**: The Google and Apple logins display warnings when clicked.
*   **Phone Gateway**: SMS inputs show notification boxes instead of active carrier hooks.
*   **Stripe Sandbox**: Pricing pages utilize mock activation codes.
*   **E2EE Claims**: No false claims of end-to-end encryption are present in client text layers.

---

## 5. Future Roadmap
*   **Web Cryptography API Integration**: Client-side encryption for letter items and chats.
*   **OAuth Authorization Servers**: Full mapping of Google and Apple SSO identities.
*   **Native Packages**: Apache Cordova / Capacitor bindings for iOS and Android deployment.
