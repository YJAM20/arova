# Stitch Handoff Implementation Map (Arova v2.1)

## 1. Stitch Pages Found in Handoff
Inside the extracted Stitch design system directory (`docs/design/stitch/export/stitch_arova_premium_private_universe_ui_ux_design_system`), we identified the following screens/templates:
- **`landing_page_arova` / `the_living_nebula_arova_landing_page`**: The primary public-facing promotional landing experience featuring the "Living Nebula" styling, scroll-revealed grids, and product copy.
- **`sign_in_arova_1` / `sign_in_arova_2`**: Auth layouts featuring a split screen, biometric sign-in, and custom input form styling.
- **`shared_universe_arova` / `shared_universe_spatial_dashboard`**: The central `/universe` space dashboard showing celestial layout modules.
- **`letters_vault_arova` / `the_vault_arova_editorial`**: The editorial layout for viewing letters.
- **`daily_planets_arova` / `the_observatory_arova`**: Custom spaces/planets directory views.
- **`security_center_arova` / `security_settings_arova`**: Profile and cryptographic keys settings.
- **`loading_sanctuary_arova` / `loading_sanctuary_arova_refined`**: Luminous transit loading panels.

---

## 2. Route Mapping
The Phase 1 Handoff implements the three public-facing entry pages:

| Stitch Design Template | Angular Route | Target Angular Component |
| :--- | :--- | :--- |
| `the_living_nebula_arova_landing_page` / `landing_page_arova` | `/` | [LandingPageComponent](file:///c:/Users/yajm2/OneDrive/Desktop/Arova/frontend/src/app/features/public/pages/landing-page/landing-page.component.ts) |
| `plans_page` (Stitch Visual Style) | `/plans` | [PlansPageComponent](file:///c:/Users/yajm2/OneDrive/Desktop/Arova/frontend/src/app/features/public/pages/plans-page/plans-page.component.ts) |
| `sign_in_arova_1` / `sign_in_arova_2` | `/auth` | [PublicAuthComponent](file:///c:/Users/yajm2/OneDrive/Desktop/Arova/frontend/src/app/features/auth/pages/public-auth/public-auth.component.ts) |

---

## 3. Design Tokens Extracted

### Colors & Gradients
- **Background**: Deep space navy-black: `#051424` (`--arova-bg-main`)
- **Primary Text / Tint**: Luminous white-blue: `#dfe0ff` (`--arova-primary`)
- **Secondary Accent**: Warm golden amber: `#f6be38` / `#ffc640` (`--arova-secondary`)
- **Muted Surface / Slate**: Grayish blue: `#c6c5d5` (`--arova-on-surface-variant`)
- **Surface Containment**: Dark Slate container: `#122031` / `#0e1c2d`
- **Radial Glow Gradient**: `radial-gradient(circle, rgba(129, 140, 248, 0.1) 0%, transparent 70%)`

### Glassmorphism Styles
- **Glass Panel (Standard)**:
  - Background: `rgba(15, 23, 42, 0.6)`
  - Backdrop Blur: `24px`
  - Border: `1px solid rgba(255, 255, 255, 0.08)`
  - Box Shadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
- **Glass Elevated (Deep)**:
  - Background: `rgba(30, 41, 59, 0.6)`
  - Backdrop Blur: `24px`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`

### Typography
- **Display Serif Font**: `Playfair Display`, `serif`
- **Functional Sans Font**: `Geist`, `sans-serif` (or fallback system sans-serif like `Inter`)
- **Typography Scale**:
  - `display-lg`: `48px` (Line Height `1.1`, Letter Spacing `-0.02em`, Weight `700`)
  - `headline-md`: `24px` (Line Height `1.3`, Weight `600`)
  - `body-lg`: `18px` (Line Height `1.6`, Weight `400`)
  - `body-md`: `16px` (Line Height `1.5`, Weight `400`)
  - `label-caps`: `12px` (Line Height `1.0`, Letter Spacing `0.1em`, Weight `600`, Uppercase)

---

## 4. Assets Needed
- No heavy local assets are required. The key imagery and background overlays in the HTML are loaded dynamically from approved secure CDN paths.
- Icons will utilize standard **Material Symbols Outlined** classes with styling overrides for weight and fill settings.

---

## 5. Visual Risks & Mitigations

| Identified Risk | Stitch Pattern | Technical Limitation | Mitigation Approach |
| :--- | :--- | :--- | :--- |
| **Backdrop Filter performance lag** | Multiple heavy blurred glass layers overlaying video | Potential frame drops on low-end mobile devices and screens | Restrict max concurrent active `backdrop-filter` elements to `3`. Apply media query overrides for mobile widths (<768px) to reduce blur to `8px` and raise opacity to `0.85` of solid colors. |
| **Tailwind vs Angular CSS** | Tailwind CSS classes utilized in Stitch templates | Arova uses vanilla SCSS structure | Translate Tailwind grid, color, and spacing utilities into semantic SCSS custom variables and flexbox/grid layout modules in `styles.scss` and page component stylesheets. |
| **Twinkling Star animation overhead** | Procedural loop via JS appending 100 HTML nodes | DOM thrashing on page load | Implement the starfield overlay using a highly optimized CSS radial gradient background and light CSS-only animations to prevent JS thread blockage. |
