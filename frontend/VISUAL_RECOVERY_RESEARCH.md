# Arova Visual Recovery Research

This document outlines the visual research, inspiration sources, layout patterns, and design directives established for Arova's frontend interface recovery phase.

---

## 1. References Reviewed

### A. General Design & Aesthetic References
* **Awwwards & Godly**: Showcases ultra-premium dark modes, immersive CSS gradients, glowing borders, high letter-spacing titles, and rich card hover transformations.
* **Lapa Ninja & Land-book**: Exhibited landing page storytelling components, scroll-revealed timelines, structured FAQ accordion grids, and immersive starry/cosmic themes.

### B. Specific Product Layout References
* **Side Navigation (Dribbble)**: 
  * Stretched `100vh` sticky bars with clear borders separating content.
  * Visually anchoring active items with left/right neon status strips.
* **Chat UI (Dribbble)**: 
  * Fixed composer anchored at the bottom of the conversation panel.
  * Bubble styling using bubble-tail details and message groupings to minimize avatar clutter.
* **Music App UI (Dribbble)**: 
  * Standardized grid layouts featuring playlists and active album overlays.
  * Vinyl disk micro-animations and active wave visuals.
* **Settings Page (UI Resources)**: 
  * Left-hand tab selectors (or left navigation columns) with structured settings forms on the right.
  * Swatches with color gradients.
* **Admin Dashboard (Dribbble / Speckyboy)**: 
  * Flat KPI dashboards with bold typographic counts.
  * Scrolling logger lists and analytical cards with visual grids.

---

## 2. Patterns Worth Using (Chosen)

1. **Uniform App Layout Shell**:
   * Sidebar fixed to `100vh`, non-scrolling, with the content pane scrolling independently next to it.
   * Standardized page wrapper sizing (`.arova-page`, `.arova-page--wide`, `.arova-page--compact`) to enforce consistent horizontal max-widths.
2. **Instagram-Inspired Profile Composition**:
   * Avatar with glowing concentric rings representing progress.
   * Statistics highlights directly under the avatar block, keeping primary profile info tight.
   * 3-column square memories grid featuring seamless cards.
3. **Cosmic Orbital Rituality**:
   * Circular orbits using CSS keyframes and SVG spheres for planets to establish visual gravity.
   * Responsive cards with checklist inputs.
4. **Subscription Limits & Tiers Indicators**:
   * Pro/Platinum badges that visual toggle simulated slots and constraints.
5. **Real Feature Flag Toggles**:
   * Professional iOS-style toggles for creator flags.
6. **Polished Chat Interface**:
   * Fixed chat box heights, scroll anchor hooks to keep scroll at bottom, and a stable message composer bar.
7. **Complete Landing Footer & Parallax Stars**:
   * complete footer sections (FAQ, Privacy, About) and parallax scrolling star backdrops.

---

## 3. Patterns Rejected & Why

* **Heavy 3D Canvas / Three.js Libraries**: Excluded to avoid massive bundle sizing and build compile errors. Clean CSS keyframes, canvas overlays, and inline SVGs provide a smoother experience.
* **Unstyled HTML Tables**: Rejected in favor of modern card grids and structured border-less layout lists to keep a premium SaaS feel.
* **Intrusive Typing Indicators**: Typing indicators are disabled in local mode to avoid fake socket polling, keeping indicators purely static or simulated cleanly.

---

## 4. Visual Direction for Arova

Arova utilizes a **"Romantic Glassmorphism"** direction:
* **Backgrounds**: Ultra-dark violet/indigo (`#0d0b13`) foundation layered with soft CSS radial lights.
* **Surfaces**: Semi-transparent panels with `backdrop-filter: blur(16px)` and thin `rgba(255, 255, 255, 0.08)` borders.
* **Typography**: Elegant serifs (`Cormorant Garamond`) for large numbers and emotional titles; clean sans-serifs (`Inter` or system UI) for labels and checklists.
* **Micro-interactions**: Scale translation, outline borders lighting up on focus, and rotate vinyl discs.

---

## 5. Scope of Full Visual Rebuilds

* **Admin Dashboard (`/admin`)**: Convert from debug tables into a premium Creator Panel with features flags, timelines, and limit grids.
* **Profile Page (`/profile`)**: Re-align metadata and photo cards to match premium grid principles.
* **Planets Page (`/planets`)**: Redesign orbital sphere animations, task cards, and planetary maps.
* **Custom Sections (`/custom-sections`)**: Structure spaces card grids, slots gauges, and list panels.
* **Settings Page (`/settings`)**: Split into a clean tabbed layout with visual themes gradients picker.
* **Chat Page (`/chat`)**: Upgrade bubble layouts, scroll anchors, and fixed composer inputs.

---

## 6. Scope of Visual Polishes (Minor)

* **Universe Dashboard**: Align cards and cards grids margins.
* **Daily Questions**: Refine textarea styles and check-in buttons.
* **Check-In**: Clean status cards and timeline entries.
* **Memories & Reasons & Letters**: Standardize list card widths and spacing.
* **Music Page**: Refine rotating vinyl disc layouts.
* **Challenges & Future Plan boards**: Fix card spacing and grid structures.
* **App Shell & Sidebar**: Lock navigation panels to full viewport heights with sticky borders.
