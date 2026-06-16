# Stitch Redesign Implementation Plan - Arova (Living Nebula v2)

This document maps out the strategy to implement the **Living Nebula v2** design system and Stitch visual specification into the Arova Angular frontend.

## 1. Screens Found in Stitch Design Package
The Stitch specification identifies the following key screens and their design intents:
- **Landing Page (`/`)**: Cinematic scroll with a Hero Shader, Glass Modules, and scroll reveals.
- **Auth / Sign In (`/auth`)**: Premium split-screen layout on desktop (stacked on mobile) with input fields, password strength meter, and local demo paths.
- **Universe Hub (`/universe`)**: Spatial dashboard layout with an absolute-positioned celestial orbit hero (which collapses to a vertical flex-stack on mobile).
- **Sanctuary Admin (`/admin`)**: A high-fidelity technical control center with a 3-column KPI grid/stack and dashboard metrics.
- **Security Center (`/security`)**: Grid + list visual for a biometric vault. *(Note: This does not map to an existing route and will be mapped or omitted if no route exists).*
- **Shared Identity (`/profile` & `/couple-profile`)**: Dual profile header with relationship stats and highlights.
- **The Vault (`/letters`)**: Editorial split layout for reading and managing letters.
- **System Loading (`/loading`)**: Full-screen shader background with shimmer text ("Aligning your universe...").
- **Error / Offline (`/offline`)**: Orbital icon and retry actions ("Signal Lost.").

---

## 2. Design Tokens Found
The design tokens specified for CSS/SCSS root variables:
- **Core Colors**:
  - Main Background / Surface Dim: `#051424` (`--arova-bg-main`)
  - Surface Bright: `#2c3a4c` (`--arova-surface-bright`)
  - Primary (Luminous Blue): `#dfe0ff` (`--arova-primary`)
  - Secondary (Amber Accent): `#f6be38` (`--arova-secondary`)
  - Tertiary (Soft Slate): `#dce2fb` (`--arova-tertiary`)
- **Glassmorphism Layers**:
  - Blur: `24px` (`--arova-glass-blur`)
  - Border: `1px solid rgba(255, 255, 255, 0.08)` (`--arova-glass-border`)
  - Background: `rgba(5, 20, 36, 0.6)` (`--arova-glass-bg`)
- **Spacing & Radius**:
  - XL Radius: `24px` (`--arova-radius-xl`)
  - Full Radius: `9999px` (`--arova-radius-full`)
  - Gutter: `24px` (`--arova-gutter`)
  - Margin (Desktop/Mobile): `64px` / `16px`
- **Typography Fonts**:
  - Display: `'Playfair Display', serif`
  - Technical: `'Geist', sans-serif`
- **Z-Index Stack**:
  - Shader: `0`, Content: `10`, Nav: `50`, Modal: `100`

---

## 3. Components Found
- `NavRail` (App Shell): 80px wide persistent desktop navigation, glass background, vertical icons, integrated partner status/avatar.
- `LuminousPill`: Status badges indicating active operations (`Syncing` - Violet, `Active` - Amber, `Secure` - Green).
- `GlassModule` / `arova-panel`: Blurred backdrop card wrappers with different depth options.
- `IntegrityGraph` / `AccessLogItem` (Admin dashboard): Polished metrics cards.
- `Orbital Icon`: Dynamic loaders and orbit animations for loading states.

---

## 4. Layout Patterns Found
- **Desktop NavRail + Content**: 80px NavRail on the left, with the main content area filling the remaining width using flex or absolute grid styling.
- **Spatial Dashboard Grid**: A relative/absolute positioning mix for `/universe` on desktop, falling back to a clean list-flex layout on mobile.
- **Editorial Split Screen**: Split layout on `/auth` and `/letters`.
- **Form Layouts**: Standard grid container styles like `.arova-form-grid` and `.arova-page--compact`.

---

## 5. Animations / Motion Patterns Found
- **Page Entrances**: Cards scaling from `0.95` to `1.0` and fading in over `600ms` with staggered delays.
- **Scroll Reveals**: Smooth fading indicators on the Landing Page.
- **Interactive States**: Micro-animations on card hover, button presses, and sidebar active link transitions.
- **Background Shader**: Three-stop CSS radial gradient mesh breathing effect.
- **Reduced Motion Support**: Strict implementation of `prefers-reduced-motion` queries to freeze orbits and remove shaders.

---

## 6. Loading, Error, and Empty States Found
- **Full App Loading Screen**: Centered loader orbit + star-canvas background + brand line + rotating sparks.
- **Backend Offline Screen**: "Signal Lost" message + "Retry Connection" / "Enter Offline Vault" buttons.
- **404 Page**: "Lost in Orbit" copy and coordinates visual.
- **Empty States (e.g. Chat)**: "Silence is a constellation" copywriting.

---

## 7. Mapping to Existing Angular Components
- `MainLayoutComponent` -> Update sidebar to act as an 80px `NavRail` on desktop.
- `LandingPageComponent` -> Skin with cinematic gradient shaders and reveals.
- `PublicAuthComponent` -> Enhance sign-in/register visual states, trim input strings, check password strength blocks, handle routing.
- `UniverseHomeComponent` -> Re-skin to spatial canvas layout, orbit graphics, today tasks, and responsive layout.
- `PlanetsHomeComponent` -> Re-theme orbits, task lists, progress ring, and add `$transition-fast` fix.
- `AdminDashboardComponent` -> Rebuild with high-fidelity control widgets, charts, features toggles, and remove raw tables.
- `ProfileViewComponent` -> Premium private profile design with highlights, metrics, and relationships stats.
- `CoupleProfilePageComponent` -> Polished shared timeline and cards.
- `ChatRoomComponent` -> Premium chat layout with bubbles, state notifications, and composer.
- `MoodRoomComponent` -> Emotion cards selection design.
- `MusicRoomComponent` -> Music visualizer, CD spin animation, and filters.
- `CustomSectionsHomeComponent` -> Polished limits/section cards.
- Shared elements (`ArovaCardComponent`, loading indicators, offline screens) -> Standardized global variables.

---

## 8. What Requires Adaptation
- **NavRail size**: The wide sidebar (260px) needs to collapse to an 80px NavRail on desktop, with hover tooltip tool and bottom action buttons cleanly organized.
- **CSS Mesh Shader**: Replacing complex CPU-intensive canvas setups with a lightweight, GPU-optimized three-stop CSS radial gradient animation.
- **Route /security and /vault**:
  - `/security` does not exist in Arova routes. It should map to `/settings` or `/universe` features instead of creating a new path.
  - `/vault` maps directly to the `/letters` or `/memories` vault route.

---

## 9. What Should NOT be Implemented
- Do not create a separate `/security` route; instead, integrate visual vault/security elements into existing components.
- Do not bypass password strength checks (score >= 3 required for registration).
- Do not touch backend code, add migrations, or implement real/mock Apple/Google SSO logic (keep placeholder styles clean).

---

## 10. Implementation Order
1. **Design System Baseline**:
   - Fix the undefined `$transition-fast` bug in `planets-home.component.scss` to unblock compilation.
   - Update `_variables.scss` and `_themes.scss` with the Stitch tokens and colors.
   - Configure all 20 themes in `ThemeService.ts` by adding them to `allowedThemes` to prevent reset loops.
2. **App Shell**:
   - Refactor `MainLayoutComponent` (HTML & SCSS) into an 80px `NavRail` on desktop and a smooth drawer on mobile.
3. **Public Pages**:
   - Re-skin Landing, Plans, Gifted Plans, Verify Account, and Onboarding pages.
   - Update `PublicAuthComponent` with strict validation rules, input trimming, password strength block, and redirection logic.
4. **Internal Pages**:
   - Polish `/universe`, `/planets`, `/chat`, `/mood`, `/profile`, `/couple-profile`, `/settings`, and `/admin`.
5. **System Pages**:
   - Enhance App Loading screen, Page Loader, offline status page, and 404 handler.
6. **Tests and Verification**:
   - Run `npm run build` and `npm run test:e2e` to verify correctness.
