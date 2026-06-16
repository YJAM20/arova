# Arova Visual Audit & Screenshot Regression Preservation

This directory contains the automated screenshot audit utility for Arova’s **Living Nebula v2** design system components.

---

## 1. Description
The screenshot script uses **Playwright** to run a headless Chromium browser instance, log in with local demo credentials, skip onboarding pages, and capture screenshots for key pages.

This ensures visual regression verification without manual clicking.

---

## 2. Prerequisites
1. Ensure the development server is running locally:
   ```bash
   npm run start
   ```
2. The server must be accessible on `http://localhost:4200/`.

---

## 3. How to Run
Execute the visual regression command:
```bash
npm run visual:audit
```
Or execute the script directly using Node:
```bash
node scripts/visual-audit/screenshot-audit.js
```

---

## 4. Visual Verification Details
*   **Screenshot Output Directory**: `visual-audit/latest/`
*   **Recommended Viewport**: `1280x800` (desktops)
*   **⚠️ Security/Hygiene warning**: Never commit private screenshots (your partner's custom letters, private photos, etc.) to the repository. The folder `visual-audit/latest/` is ignored by `.gitignore`.

---

## 5. Captured Routes

The utility automatically crawls and captures the following routes:
1.  `/` (Landing Page)
2.  `/auth` (Public Sign In)
3.  `/universe` (Spatial Hub)
4.  `/planets` (Cosmic Ritual Map)
5.  `/profile` (Shared Identity)
6.  `/custom-sections` (Space Custom Limits)
7.  `/admin` (Integrity Console Dashboard)
8.  `/settings` (Preferences Console)
9.  `/chat` (Sanctuary Transmitter)
10. `/music` (Shared Resonance Vinyl)
11. `/mood` (Emotional Aura Sanctuary)
12. `/letters` (Wax-sealed Vault)
13. `/reasons` (Constellation of Care)
14. `/memories` (Instagram Grid Preserves)
15. `/future` (Shared Journeys Column)
16. `/challenges` (Shared Milestones)
17. `/daily-questions` (Couple Transmission Log)
18. `/check-in` (Resonance Chart)
19. `/couple-profile` (Pairing Setup status)
20. `/non-existing-route` (Orbital 404 screen)
