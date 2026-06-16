# Visual Before / After Notes

This document highlights the specific visual issues identified and fixed during this visual fidelity pass.

---

## 1. Global Nebula Background
- **Before Problem**: The animated radial mesh gradient (`.stars-bg`) was completely hidden behind solid color layers, looking like a flat `#051424` dark blue background.
- **What Changed**: Modified `src/styles.scss` to bind the `.stars-bg` mesh gradient and stars pseudo-element directly to the `body` selector globally.
- **Why it matches Stitch better**: Every page (public and authenticated views) now has a breathing celestial background matching the cinematic Living Nebula v2 design direction.
- **Remaining Limitation**: On very slow devices, the mesh gradient animation is slowed down or disabled via `@media (prefers-reduced-motion: reduce)` media queries.

## 2. Universe Dashboard (`/universe`)
- **Before Problem**: Shortcut buttons and list items used basic plain characters (like `?`, `5`, `~`, `[]`, `<>`) as placeholder icons, looking raw and unstyled. Cards looked flat.
- **What Changed**: Replaced the text character placeholders with beautiful custom inline SVGs (speech questions, smiley moods, chat bubbles, cameras, stars, envelopes, and settings icons).
- **Why it matches Stitch better**: Interactive components look polished, modern, and high-fidelity instead of debug outputs.
- **Remaining Limitation**: The stats count relies on simulated mock data when backend is not running.

## 3. Sanctuary Creator Console (`/admin`)
- **Before Problem**: Squeezed layouts, concatenated text strings (like "12msSanctuary Sync", "Manage ReasonsLove cards"), unstyled progress bars, and debug-like checkbox controls.
- **What Changed**: Added CSS layout fallbacks (for flex wrapping, columns, and absolute alignments) to replace missing Tailwind classes. Replaced raw checkboxes with beautiful CSS-driven sliding toggles. Resolved text concatenation bugs by enforcing block display styles.
- **Why it matches Stitch better**: The layout wraps and aligns cleanly, features a cohesive spacing system, and presents feature flags as responsive interactive switches.
- **Remaining Limitation**: Latency metrics are simulated constants in local mode.

## 4. Custom Sections (`/custom-sections`)
- **Before Problem**: Concatenated text label "Travel List2 lists item(s)", unstyled input and buttons, flat violet card colors.
- **What Changed**: Enforced block layouts on header lines, styled form fields and inputs to use correct glass focus borders, and used theme-aware color-mix parameters on the active sections state.
- **Why it matches Stitch better**: Section items dynamically switch colors depending on active themes, layout spacing is correct, and checkboxes look custom-designed.
- **Remaining Limitation**: Toggling pricing tier states only simulated limit counts locally.

## 5. Profile page (`/profile`)
- **Before Problem**: Broken image placeholder displaying text "Avatar", and stats strings concatenated (like "3Memories", "3Letters").
- **What Changed**: Generated a high-fidelity default avatar image (`assets/images/default-avatar.png`) using the image generator, updated the service/template fallbacks to point to it, and resolved text spacing for points/counts.
- **Why it matches Stitch better**: The avatar fits perfectly inside a glowing animated progress ring and renders a premium default astronaut asset. Stat blocks are distinct and aligned.
- **Remaining Limitation**: Uploading a custom avatar link is limited to standard URL links.
