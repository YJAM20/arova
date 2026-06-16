# Frontend UX Research Notes - Arova Final Polish

These notes document UX research and design inspirations for the visual polish and reliability enhancements in Arova.

---

## 1. References Reviewed & Inspiration Matrix

### Side Navigation (Dribbble navigation-bar inspiration)
* *Design Principle*: Stretched full height, visually stable during scroll, compact vertical hierarchy, micro-interaction states.
* *Arova Application*: Eliminate bottom cutoff of the sidebar. Apply fixed sizing, flex layout heights, and clean active state indicators. Remove/hide secondary developer panels (`Backup` and `API Account`) from primary menus to focus on core features.

### Chat UI (Dribbble chat-ui-design inspiration)
* *Design Principle*: Dynamic flex boxes, clear text contrast, message grouping, bubble alignment, composer actions, and real-time state feedback.
* *Arova Application*: Revamp own vs. partner alignments, add color borders, wrap inputs with custom flex styling, and stabilize scrolling viewport bounds.

### Music App UI (Dribbble music-app-ui inspiration)
* *Design Principle*: Dark themed visual playlist tiles, dynamic playing panels, mood categorization, volume sliders, and play status toggles.
* *Arova Application*: Standardize music player layout into a premium music room with mood-based playlists, mock sound controllers, and modern song card list grids.

### Settings UI (Settings Page inspiration)
* *Design Principle*: Multi-tab categories, clean borders, inline switches, accessible descriptions, and hidden/advanced options nested under admin/developer tabs.
* *Arova Application*: Re-organize settings into clean panels. Keep settings clear by hiding backups and raw credentials from general couples navigation.

---

## 2. Ideas Chosen & Implemented

1. **Animated Celestial background on Landing**: Add orbit and star movement feeling using CSS animation rules and SVG configurations in the landing hero section.
2. **Password Security Enforcement**: Block weak passwords programmatically. Require minimum password strength "Good" (or score >= 3) to prevent weak signups.
3. **Beautiful Mood Face Chips**: Introduce emoji-based face emotion cards (Loved, Distant, Tired, Grateful, Excited) that change sizes/highlights on selection.
4. **Complete Landing Website Footer**: Build complete footer links detailing Arova branding, Privacy statement, FAQ list, and planned E2EE details.

---

## 3. Ideas Rejected & Why

* **Live Streaming Audio Integration**: Excluded due to potential payload bottlenecks and copyright conflicts. Keeps audio mock player fully local.
* **Heavy Layout Animation Frameworks**: Excluded (e.g. framer-motion ports) to prevent bundle bloat and ensure fast execution in the Angular compiler.
* **Complete Database Deletions**: Retained backup services and backup API paths, simply hiding them from main sidebar routing menus to keep them accessible to developers via direct URL routing when required.
