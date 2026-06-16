# Arova Documentation Directory Index

This document coordinates and lists all documentation files available in the Arova Angular frontend repository to help developers and reviewers navigate the codebase.

---

## 📂 Core Documentation Index

### 1. General Project Information
*   [README.md](./README.md): The primary entry point. Outlines the Arova product description, core features, tech stack, setup commands, Local Mode vs API Mode, testing, and limitations.
*   [PORTFOLIO_NOTES.md](./PORTFOLIO_NOTES.md): Summary of architectural guidelines and presentation notes for engineering portfolios and recruiters.
*   [RELEASE_NOTES.md](./RELEASE_NOTES.md): Preview release notes detailing the version capabilities, roadmap, and local verification steps.

### 2. Design System & Stitch Redesign
*   [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md): Detailed specification of the Arova design system, listing color tokens, typography variables, global glassmorphism guidelines, and utility layout structures.
*   [UX_UPGRADE_NOTES.md](./UX_UPGRADE_NOTES.md): Summary of user experience enhancements, transition configurations, accessibility hardening, and performance controls.

### 3. QA and Visual Verification Reports
*   [STITCH_VISUAL_QA_REPORT.md](./STITCH_VISUAL_QA_REPORT.md): The visual regression checklist comparing routes to Stitch design inputs, listing screenshot references, scores, and mock integration flags.
*   [REAL_BROWSER_VISUAL_AUDIT.md](./REAL_BROWSER_VISUAL_AUDIT.md): Route-by-route manual inspection scorecard checking backgrounds, card layouts, spacing, and empty states.
*   [QA_PUBLIC_FLOW.md](./QA_PUBLIC_FLOW.md): Strategic guide separating automated Playwright coverage from manual backend registration/pairing workflows.
*   [FRONTEND_GITHUB_READINESS_AUDIT.md](./FRONTEND_GITHUB_READINESS_AUDIT.md): Repository hygiene audit planning target structures and ignore guidelines for public commits.
*   [FRONTEND_PRIVACY_SCAN_REPORT.md](./FRONTEND_PRIVACY_SCAN_REPORT.md): Scans for credentials, tokens, real email patterns, and Windows system path leaks.

### 4. UI Architecture & Performance
*   [UI_SCREEN_STATES.md](./UI_SCREEN_STATES.md): Outline of UI page wrappers, loading overlays, skeleton templates, empty lists, and error scopes.
*   [FRONTEND_VISUAL_PERFORMANCE_NOTES.md](./FRONTEND_VISUAL_PERFORMANCE_NOTES.md): Technical details concerning backdrop filter optimizations, prefers-reduced-motion triggers, GPU layer rendering, and viewport rendering.

### 5. Automated Tests & Scripts Guides
*   [e2e/README.md](./e2e/README.md): Explanations of Playwright specs (public flows, local mode logins, placeholders warnings, and layout rules).
*   [scripts/visual-audit/README.md](./scripts/visual-audit/README.md): Instructions on running Playwright headless screenshots, capture configurations, and ignore parameters.
*   [SCREENSHOTS_GUIDE.md](./SCREENSHOTS_GUIDE.md): Recommendations on viewport scopes and recommended layout orders for public repository presentation.
