# Stitch-to-Arova Implementation Plan (Living Nebula v2)

This plan maps the visual specification from the Stitch handoff package (`arova_developer_implementation_package.md`) to the actual Arova Angular route and component structure.

## 1. Stitch Sections Reviewed
We reviewed the following design specifications:
- **Living Nebula v2 theme spec**: Deep glass, premium cinematic universe styling, absolute/relative spatial layouts.
- **Glassmorphism performance directives**: Maximum of 3 blur panels on screen, mobile blur reductions (max 6-8px), and prefers-reduced-motion support.
- **System screens copywriting**: Loading, offline, 404, and empty states.
- **Component blueprints**: NavRail (persistent 80px side rail), LuminousPill status indicators, GlassModule containers, integrity widgets, and circular avatar progress rings.

## 2. Routes That Map Directly
- **Universe Hub** → `/universe` (Spatial canvas dashboard)
- **Sanctuary Admin** → `/admin` (Creator console & technical integrity widgets)
- **Shared Identity** → `/profile` and `/couple-profile` (Private Instagram-inspired views)
- **The Vault** → `/letters` (Wax-sealed envelopes vault)
- **Planets** → `/planets` (Cosmic ritual checklist and orbit maps)
- **Auth / Sign In** → `/auth` (Split-screen premium entry)

## 3. Routes That Need Adaptation
The Stitch handoff mentions generic paths that require mapping:
- **`/auth/signin`** → Maps to Arova `/auth` (using `PublicAuthComponent`).
- **`/vault`** → Maps to Arova `/letters` (sealed vault) and `/memories` (shared vault).
- **`/security`** → Adaptive. Integrated into `/settings` and `/admin` panels as a visual security checklist instead of creating a redundant route.
- **`/error`** → Maps to Arova `/offline` (`BackendOfflinePageComponent`) and generic error templates.

## 4. Stitch Ideas to Implement Now
- **NavRail route labels & tooltips**: Add keyboard shortcuts, clear active route borders, responsive mobile overlay drawer, and icon labels or tooltips.
- **System loading states**: Clean centered spinner layouts with rotating canvas stars, brand tagline, and breathing status messages.
- **Proper error pages**: Re-skin `/offline` (Signal Lost) and `/404` (Lost in Orbit) with premium visuals and functional retry / recovery button triggers.
- **Full Visual Rebuilds**:
  - `/admin`: KPI grids, system health modules, flags dashboard, recent activity timeline (removing raw styles and debug tables).
  - `/profile`: Circular avatar with progress ring, stats row (Memories, letters, reasons, completions), Instagram-style photo grids.
  - `/planets`: Breathing planet visuals, progress bars, checklists, and orbit lines.
  - `/custom-sections`: Limit slot meters, subscription tier simulations, and modal grids.

## 5. Stitch Ideas to Postpone
- **Apple/Google login execution**: Left as clean, labeled provider placeholders (mock clicks will warn the user they are placeholders).
- **True client-side E2EE**: Expressed honestly in copy as a planned feature.

## 6. Stitch Ideas to Reject
- **WebGL requirements on basic loaders**: Replace complex WebGL scripts with lightweight, CSS radial-gradient mesh transitions to maintain zero-GPU overhead on mobile and low-power devices.
- **Redundant `/security` route**: Keep settings consolidated under `/settings` rather than fracturing the configuration space.

## 7. Components to Create/Update
- **`ArovaAppLoadingScreenComponent`**: Center overlay styling, responsive star fields, and tagline animations.
- **`ArovaPageLoadingComponent`**: Elegant inline loading animations.
- **`ArovaSkeletonCardComponent`**: Shimmer layouts for loading content cards.
- **`ArovaInlineSpinnerComponent`**: Compact canvas loaders.
- **`ArovaErrorScreenComponent`**: Standardized component for general crashes.
- **`NotFoundPageComponent`**: The cosmic 404 handler.
- **`BackendOfflinePageComponent`**: Connection failure view with retry actions.

## 8. Pages Needing Full Visual Rebuild
- **Admin Dashboard (`/admin`)**: Convert raw panels and capabilities to high-fidelity grid widgets.
- **Profile (`/profile`)**: Re-align to a personal sanctuary dashboard with relationship stats.
- **Planets (`/planets`)**: Re-skin orbit hero graphics, checklists, and map grids.
- **Custom Sections (`/custom-sections`)**: Redesign layout, plan toggle cards, and section limit meters.
- **Settings (`/settings`)**: Polish tabs structure (General / Appearance / Profile), swatch layouts, and privacy copies.

## 9. Pages Needing Polish Only
- **Chat (`/chat`)**: Speech bubble style refinement, composer centering, and connection indicators.
- **Landing page (`/`)**: Fix container constraints, scroll reveals, FAQ accordions, and CSS mesh colors.
- **Auth page (`/auth`)**: Stricter password checks, clear error resets, and layout centering.
- **Verify Account (`/verify-account`)**: Verification visual clarity.

## 10. Risk Controls for Glassmorphism & Performance
- Set `--arova-glass-blur-desktop: 24px` and `--arova-glass-blur-mobile: 8px`.
- Limit active backdrop filters to 3 overlay boxes at once on mobile.
- Use `prefers-reduced-motion` styles to freeze animations and gradients.
