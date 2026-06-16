# Arova UI/UX Design System (v1)

Arova’s design identity centers around creating a premium, calm, warm, and highly private digital sanctuary for couples. This system establishes a coherent, theme-compatible framework using semantic CSS variables, standalone shared UI components, and micro-interactions.

---

## 1. Color Palettes & Theme Tokens

The design system maps dynamic `:root` CSS variables onto active theme assets, ensuring seamless visual harmony across light and dark settings.

### Base Colors (Semantic Mapping)
All colors adapt to the selected theme in `Settings`:
* **Background (`--arova-background`)**: The deepest foundation of the application space.
* **Surface (`--arova-surface`)**: Underlying panel surfaces, sidebars, and navigation rails.
* **Surface Elevated (`--arova-surface-elevated`)**: Higher layer overlays, dropdowns, and cards.
* **Text Primary (`--arova-text-primary`)**: Readability-focused soft cream or light gray.
* **Text Secondary (`--arova-text-secondary`)**: Descriptive text and subtitles.
* **Muted/Dim (`--arova-muted`)**: Non-interactive placeholders and indicators.
* **Border (`--arova-border`)**: Elegant boundaries with thin alpha borders.
* **Accent (`--arova-accent`)**: Warm romantic rose/pink highlights.
* **Accent Soft (`--arova-accent-soft`)**: Forest green or soft theme pastel accents.
* **Success/Danger/Warning**: Muted functional colors.

---

## 2. Spacing & Borders

* **Border Radii**:
  * `--arova-radius-sm`: `8px` (Inputs, Pills, Badges)
  * `--arova-radius-md`: `16px` (Standard Content Cards, Dialog Overlays)
  * `--arova-radius-lg`: `24px` (Panels, Sections, Page Boundaries)
  * `--arova-radius-xl`: `36px` (Custom layout decorations)
* **Shadows**:
  * `--arova-shadow-soft`: `0 4px 20px rgba(0, 0, 0, 0.12)`
  * `--arova-shadow-card`: `0 8px 30px rgba(0, 0, 0, 0.18)`
  * `--arova-shadow-glow`: `0 0 15px rgba(231, 166, 182, 0.1)`

---

## 3. Typography

* **Display/Heading Font**: `Cormorant Garamond`, `Georgia`, or `serif` for elegant, emotional headings.
* **Body Font**: Sans-serif systems (`Inter`, `system-ui`) focusing on readability, micro-copies, and chat inputs.

---

## 4. Shared Standalone UI Components

Arova relies on six lightweight, standalone Angular UI components:

### 1. `ArovaPageHeaderComponent`
Renders structured, responsive headers with title, subtitle, eyebrow descriptors, and layout action slots.
* **Selector**: `arova-page-header`
* **Inputs**:
  * `title: string` (Primary heading)
  * `subtitle?: string` (Contextual count or info)
  * `eyebrow?: string` (Visual planet context)
* **Slots**:
  * `<ng-content select="[actions]"></ng-content>` for creation links.

### 2. `ArovaCardComponent`
Base glassmorphic container with micro-animations and glowing overlays.
* **Selector**: `arova-card`
* **Inputs**:
  * `hoverable: boolean` (Default `true`. Enables scale/glow on hover)
  * `glow: boolean` (Default `false`. Activates ambient card glow)
  * `borderColor?: string` (Optional custom border tint)

### 3. `ArovaEmptyStateComponent`
Visual placeholder for missing data or initial states.
* **Selector**: `arova-empty-state`
* **Inputs**:
  * `icon: string` (Default `✧`)
  * `title: string` (Heading)
  * `description: string` (Call to action explanation)
  * `actionText?: string` (Optional action text)
  * `actionLink?: string` (Optional action route link)

### 4. `ArovaStatusPillComponent`
Displays badges, category states, and Visibility mode (Local / API).
* **Selector**: `arova-status-pill`
* **Inputs**:
  * `type: 'success' | 'warning' | 'danger' | 'info' | 'accent'`
  * `showDot: boolean` (Default `true`. Show or hide leading indicator)

### 5. `ArovaSectionHeaderComponent`
Lightweight header for card divisions or sub-panels.
* **Selector**: `arova-section-header`
* **Inputs**:
  * `title: string`
  * `description?: string`

### 6. `ArovaLoadingStateComponent`
Sensory loading indicator for slow networks.
* **Selector**: `arova-loading-state`
* **Inputs**:
  * `message: string` (Default `"Loading your shared universe..."`)

---

## 5. Micro-interactions, Streaks & Gamification

* **Hover Transitions**: Standardized to `var(--arova-transition-fast)` (`0.15s ease`) for prompt feedback.
* **Reduced Motion Option**: All animations obey user browser options via `@media (prefers-reduced-motion: reduce)` and Settings preference (`:root.animations-off`), dropping animations instantly to prevent discomfort.
* **Active Progress Rings**: Circular avatars on `/profile` feature a dynamic SVG border indicating progress percentages towards the next relationship rank (from Spark to Eternal Orbit).
* **Simulated Pricing Limits**: Slots meters in `/custom-sections` display dynamic progress fills tracking section utilization limits.
* **Swatch Cards**: Swatches on `/settings` render gradient previews of each palette.
