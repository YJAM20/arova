# Changelog

## v2.0.0 — Arova Version 2 Upgrade

### Added
- Upgraded root landing, auth, verify-account, onboarding, profile-setup, and pairing-choice pages to premium Living Nebula v2 styles.
- Overhauled universe dashboard with personalized greetings, quick actions, relationship stats, and latest moments previews.
- Redesigned Memories archive, memory details, and add/edit flows to use cinematic photo cards and custom tags.
- Polished Reasons vault with heart/tear/smile reactions and a daily highlighted reasons view.
- Upgraded Letters vault, letter details, and letter editor forms with unsealing timers and wax seal visual signatures.
- Upgraded Mood room check-in with check-in selectors, daily summary stats, and partner status widgets.
- Upgraded Music room track manager with list management, mood filters, and summary stat panels.
- Upgraded Future board with bucket list grids, target dates, and travel/milestone categories.
- Overhauled Chat room withSignalR real-time chat, shimmer skeleton loading states, and E2EE security limitations warnings.
- Upgraded Settings page with tabbed control cards, a grid of 20 color themes, and custom tooltips.
- Overhauled Planets system map and daily couple rituals checklist.
- Overhauled Custom Sections builder with simulated pricing tier slots (Free, Pro, Platinum) and customizable emoji categories.
- Pruned unused component imports across features to ensure 100% warning-free production builds.
- Expanded Playwright E2E coverage to 453 test cases passing across Chromium, Firefox, and WebKit.
- Simplified Netlify deployments to a single root-level configuration with SPA redirects.

## v1.0.0 — Arova Portfolio Preview

### Added
- Full Angular frontend
- ASP.NET Core backend
- Local Mode and API Mode
- Public landing/auth/onboarding flow
- Couple pairing flow
- Universe dashboard
- Planets system
- Relationship points/ranks
- Memories, reasons, letters
- Mood, music, chat
- Challenges and future plans
- Custom sections
- Admin dashboard
- Living Nebula design system
- Playwright E2E tests
- Visual screenshot audit script
- Backend Swagger documentation
- GitHub-ready docs and CI setup

### Known Limitations

- Google/Apple login are placeholders
- SMS verification is mocked
- Payment/billing is not connected to a real provider
- True E2EE is not implemented yet
- SQLite is used for local development
