# Arova: Final Developer Implementation Package (Living Nebula v2)

This document is the final technical handoff for the Arova web application. It provides exact specifications for applying the **Living Nebula** design system to the existing Angular codebase.

---

## 1. Final Screen Audit Table

| Screen | Route | Target Quality | Priority | Desktop Layout | Mobile Layout | Main Components | Loading/Error/Empty | Risks |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| **Landing Page** | `/` | 10/10 | P1 | Cinematic scroll | Single column | Hero Shader, Glass Module | L: Yes / E: No / M: No | Scroll performance |
| **Auth / Sign In** | `/auth/signin` | 9/10 | P0 | Split screen | Stacked | Input, Primary Button | L: Yes / E: Yes / M: No | Focus ring contrast |
| **Universe Hub** | `/universe` | 10/10 | P1 | Spatial canvas | Vertical cards | Spatial Card, Pulse Pill | L: Yes / E: Yes / M: Yes | GPU load (blur) |
| **Sanctuary Admin**| `/admin` | 9/10 | P1 | KPI Grid | KPI Stack | KPI Card, Admin Graph | L: Yes / E: Yes / M: No | Data density |
| **Security Center**| `/security` | 9/10 | P0 | Grid + List | Single column | Biometric Vault, List | L: Yes / E: Yes / M: No | Logic complexity |
| **Shared Identity**| `/profile` | 9/10 | P1 | Centered dual | Stacked dual | Profile Header, Stats | L: Yes / E: No / M: No | Responsive scaling |
| **The Vault** | `/vault` | 9/10 | P2 | Editorial split | Single column | Letter Item, Detail | L: Yes / E: Yes / M: Yes | Type legibility |
| **Sanctuary Mobile**| N/A | 10/10 | P0 | N/A | Gesture-based | Mobile Nav, Thumb Zone | L: Yes / E: Yes / M: No | Touch targets |
| **Loading State** | `/loading` | 10/10 | P0 | Full screen | Full screen | Shader, Shimmer Text | L: Yes / E: No / M: No | Bundle size |
| **Error (Offline)** | `/error` | 10/10 | P0 | Full screen | Full screen | Orbital Icon, Action | L: No / E: Yes / M: No | Route loop |

---

## 2. Route-to-Design Mapping

### Route: `/universe` (The Spatial Dashboard)
*   **Design Intent**: Exploration-first hub. Break the 12-column grid for the "Orbit" hero.
*   **Layout**: Fixed sidebar (80px), absolute-positioned modules over a global background.
*   **Components**: `SpatialModule`, `LuminousPulse`, `BackgroundShader`.
*   **Responsive**: Collapse absolute positioning to a vertical flex-stack on screens < 1024px.
*   **Dev Notes**: Use `z-index` layers carefully: Shader (0), Ambient Orbits (5), Content (10).

### Route: `/admin` (Sanctuary Integrity)
*   **Design Intent**: High-fidelity technical control center.
*   **Layout**: 3-column dashboard grid. Top row: 3x KPI modules. Bottom row: 1x Graph + 1x List.
*   **Components**: `IntegrityGraph`, `MetricPill`, `AccessLogItem`.
*   **States**: "Syncing" (animated pulse), "Secure" (static green), "Integrity Risk" (static amber).

---

## 3. Design Tokens Final Spec (SCSS/CSS)

```css
:root {
  /* Colors */
  --arova-bg-main: #051424;
  --arova-surface-dim: #051424;
  --arova-surface-bright: #2c3a4c;
  --arova-primary: #dfe0ff; /* Luminous Blue */
  --arova-secondary: #f6be38; /* Amber Accent */
  --arova-tertiary: #dce2fb;
  
  /* Glass Layers */
  --arova-glass-blur: 24px;
  --arova-glass-border: 1px solid rgba(255, 255, 255, 0.08);
  --arova-glass-bg: rgba(5, 20, 36, 0.6);
  
  /* Radius & Spacing */
  --arova-radius-xl: 24px;
  --arova-radius-full: 9999px;
  --arova-gutter: 24px;
  --arova-margin-desktop: 64px;
  --arova-margin-mobile: 16px;
  
  /* Typography */
  --arova-font-display: 'Playfair Display', serif;
  --arova-font-technical: 'Geist', sans-serif;
  
  /* Z-Index Stack */
  --z-shader: 0;
  --z-content: 10;
  --z-nav: 50;
  --z-modal: 100;
}
```

---

## 4. Glassmorphism Performance Rules

1.  **Usage Restriction**: Limit `backdrop-filter` to a maximum of 3 visible elements on screen at once.
2.  **Mobile Fallback**: For mobile (UA detection or screen width < 768px), reduce `blur` to `8px` or switch to a solid `rgba(5, 20, 36, 0.9)` background.
3.  **Low Power Mode**: Detect `prefers-reduced-motion`. If true, disable `backdrop-filter` and all procedural shaders.
4.  **Edge Case**: Use `will-change: transform` on glass modules to trigger GPU rasterization, but avoid on more than 2 elements.

---

## 5. Background / Shader Implementation Spec

| Feature | Option A (Recommended) | Option B | Option C |
| :--- | :--- | :--- | :--- |
| **Technique** | **CSS Gradient Mesh** | **SVG Orbital Paths** | **WebGL Fragment Shader** |
| **Visuals** | High (Smooth, Breathing) | Medium (Geometric) | Extreme (Fluid, Procedural) |
| **Performance** | Best (Zero GPU overhead) | Good | High Risk (Mobile lag) |
| **Usage** | Global App Background | Ritual Completion | Landing Hero Only |
| **Default** | **Yes** | **No** | **Optional** |

**Recommendation**: Implement a three-stop CSS radial gradient mesh for the global background. Use `Option C` only for the `/loading` and `/universe` routes behind a lazy-loaded component.

---

## 6. Component Library Final Spec

### `NavRail` (App Shell)
*   **Purpose**: Persistent desktop navigation.
*   **Design**: 80px width, glass background, vertical icons, integrated partner status avatar at bottom.
*   **Accessibility**: Use `<nav>`, `aria-label="Global Navigation"`, and keyboard shortcuts (1-5).

### `LuminousPill`
*   **Purpose**: Status indication.
*   **Design**: Pill-shaped, semi-transparent background, 8px pulsing dot.
*   **Variants**: `Syncing` (Violet), `Active` (Amber), `Secure` (Green).

### `GlassModule`
*   **Purpose**: Primary container.
*   **Props**: `variant: ['flat', 'deep', 'tinted']`, `padding: ['sm', 'md', 'lg']`.
*   **Design**: `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.08)`.

---

## 7. Page Implementation Blueprints: Universe Dashboard

*   **Structure**: 
    1. `NavRail` (Left)
    2. `MainScrollArea` (Right of Rail)
    3. `HeroOrbit` (Center absolute)
    4. `ModuleGrid` (Relative/Absolute mix)
*   **Motion**: On entry, modules scale from `0.95` to `1.0` and fade in over `600ms` with staggered delays (`+100ms` per card).
*   **Mobile**: Convert `HeroOrbit` to a sticky header and `ModuleGrid` to a standard vertical list.

---

## 8. System Screen Copywriting (Final)

*   **App Loading**: "Aligning your universe..." / "Synchronizing shared resonance."
*   **Backend Offline**: "Signal Lost." / "Re-establishing connection with the sanctuary. Your presence in the Living Nebula is currently desynchronized." (Buttons: `Retry Connection`, `Enter Offline Vault`)
*   **404**: "Lost in Orbit." / "The coordinate you are looking for does not exist in this sector." (Button: `Return to Sanctuary`)
*   **Empty Chat**: "Silence is a constellation." / "Begin a new transmission to your partner."

---

## 9. Accessibility Hardening Plan

1.  **Contrast**: Ensure all text over glass modules meets WCAG AA (4.5:1). Use dark overlays if necessary.
2.  **Focus States**: All interactive elements must have a `2px solid var(--arova-primary)` focus ring with `4px` offset.
3.  **Touch Targets**: Minimum `44x44px` for all mobile buttons, especially the bottom navigation icons.
4.  **Motion**: All shaders must respect `(prefers-reduced-motion: reduce)` by freezing on the first frame or transitioning to a static gradient.

---

## 10. Final Antigravity Handoff Summary

1.  **Phase 1 First**: Update `styles.scss` with the **Design Tokens** and build the `NavRail` component.
2.  **Files to Touch**: `app.component.html`, `theme.scss`, `nav-rail.component.*`, `shared-glass.component.*`.
3.  **Tests**: Update Playwright visual regression tests for `/universe` and `/auth`.
4.  **Validation**:
    *   `npm run build` — Verify zero SCSS errors.
    *   `npm run test:e2e` — Ensure no breaking changes to selectors.
5.  **Manual Inspection**:
    *   Check `/universe` on mobile to ensure blur performance is stable.
    *   Verify `/error` state maintains the "Living Nebula" aesthetic.

**Developer handoff summary:** Apply the **Design Tokens** first. Implement the **App Shell** (Nav Rail + Global Background). Use the **Spatial Dashboard** as the performance baseline for all glassmorphism work.
