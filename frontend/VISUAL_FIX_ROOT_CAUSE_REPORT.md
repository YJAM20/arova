# Visual Fix Root Cause Report

This report documents the structural, styling, and encapsulation issues that prevent the **Living Nebula v2** design from rendering correctly in the browser.

---

## 1. Diagnostics & Root Cause Analysis

### 1. Are the edited SCSS files actually imported/used?
**Yes.** `src/styles.scss` is correctly registered in `angular.json` under `architect.build.options.styles` and is compiled into the main bundle.

### 2. Are component styles overriding global styles due to encapsulation?
**Yes.** Angular components use `ViewEncapsulation.Emulated` by default. This appends unique attributes (like `_ngcontent-x`) to HTML tags and scoping component-specific CSS. Local card layouts and page sheets that define `.glass` or `.glassmorphism` overrides inside their own components SCSS files override the global style declarations.

### 3. Are global classes like `.glassmorphism`, `.stars-bg`, `.arova-glass-module` actually applied in templates?
**Yes, but inconsistently.** Some templates have `.glass` or `.glassmorphism`, but they are often combined with local overrides, or the layouts lack standard page container wrappers (`.arova-page`, `.arova-page--wide`, `.arova-page--compact`), leading to padding and sizing issues.

### 4. Are page root elements missing the needed classes?
**Yes.** Some pages (like `/universe` and `/admin`) use custom, component-specific wrappers (such as `.universe-dashboard` and `.admin-page`) rather than the standardized Arova page wrapper classes (`.arova-page`, `.arova-page--wide`).

### 5. Are backgrounds hidden behind solid containers?
**Yes.** Although `.stars-bg` is applied to `.layout`, the radial gradients are too subtle. Furthermore, active themes set solid background colors (`--theme-bg` and `--theme-surface`) on parent and wrapper elements, which creates an opaque sheet over the breathing mesh background.

### 6. Are local cards still using old class names?
**Yes.** A few cards use older local card CSS classes with hardcoded background colors like solid dark purple or solid blue, ignoring the theme variables.

### 7. Are pages using unstyled HTML elements instead of shared Arova components?
**Yes.** The `/admin` and `/settings` forms and grids contain raw buttons, selects, and checkboxes styled with basic default browsers look, making them look like raw debug panels.

### 8. Are CSS variables resolving correctly?
**Yes.** Inspecting computed properties shows CSS variables like `--theme-bg` are loaded correctly, but the values mapped to them (e.g. `--primary-color: var(--theme-accent)`) are overridden or not fully utilized in local custom component styling.

### 9. Are theme tokens actually applied to the body/root?
**Yes.** `ThemeService` appends the correct theme class (e.g. `.theme-dark-romantic`) to `documentElement` and `body` on initialization and when switching themes.

### 10. Is the browser caching old styles?
**No.** Hot module replacement and standard browser reload correctly update styling, but the CSS layout overrides are built directly into the compiled stylesheets.

### 11. Are some pages not using the updated layout shell?
**Yes.** Public pages (like landing, auth, and onboarding) do not use the layout shell, and their local templates set solid dark background overrides.

### 12. Are the Stitch design assets/screens imported but not actually mapped?
**Yes.** Page templates like `/universe` use plain characters (like `?`, `5`, `~`, `[]`, `<>`) instead of beautiful SVG icons from the Stitch design guidelines.

---

## 2. Core Fix Strategy

1. **Vibrant Nebula Background**: Redefine `.stars-bg` with distinct, visible breathing mesh gradients that blend accent colors correctly.
2. **Remove Local Overrides**: Clean up local component SCSS files by deleting local `.glassmorphism`, `.glass`, and custom card backgrounds.
3. **Map Missing Layout Helpers**: Define missing Tailwind utility classes in `src/styles.scss` (like `lg:grid-cols-3`, `w-11`, `h-6`, etc.) so the existing layout markup works correctly out of the box, or rewrite templates to use standard Arova class naming.
4. **Premium Icons and Alignment**: Replace emoji/text placeholders in `/universe` and planets with elegant inline SVG icons. Fix text concatenations and alignment bugs on `/admin`, `/profile`, and `/custom-sections`.
