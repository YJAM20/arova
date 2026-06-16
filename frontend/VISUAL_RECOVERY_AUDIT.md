# Arova Visual Recovery Audit

This document compiles the screen-by-screen visual audit of the Arova frontend. Every page has been evaluated on layout, typography, spacing, styling, and mobile responsiveness.

---

## 1. Internal Pages (With Sidebar)

### A. Universe Dashboard (`/universe`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Standard greeting cards have inconsistent borders. Card items lack unified margins.
* **Layout Problems**: The space stats cards float awkwardly with too much empty space on wider screens.
* **Typography Problems**: Page headers use small sans-serif instead of elegant Cormorant serif font family.
* **Spacing Problems**: Margins are tight; needs more breathing space between grid columns.
* **Mobile Problems**: Cards stack too close together.
* **What Must Be Fixed**: Standardize to `.arova-page--wide` container, apply premium glass cards with hover glow.
* **Rebuild or Polish**: Polish.

### B. Planets Space Map (`/planets`)
* **Visual Quality Score**: 4 / 10
* **Main Problems**: Planet cards look like unstyled stacked list panels. The orbital ring is simple and lacks premium lighting/rotation animations.
* **Layout Problems**: Checklist row is squished inside page containers.
* **Typography Problems**: Headers are inconsistent.
* **Spacing Problems**: Massive empty margins on desktop viewports.
* **Mobile Problems**: Text overlaps planet spheres.
* **What Must Be Fixed**: Full rebuild of planet sphere design, orbits visualizer, responsive card grids, and task row elements.
* **Rebuild or Polish**: Full Rebuild.

### C. Daily Questions (`/daily-questions`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Textareas look like default HTML text fields.
* **Layout Problems**: Squeezed on the right side of the screen.
* **Typography Problems**: Submission button text uses plain sans-serif weights.
* **Spacing Problems**: Button sits too close to textarea bounds.
* **Mobile Problems**: Forms stretch edge-to-edge without padding.
* **What Must Be Fixed**: Standardize layout wrappers, apply custom textareas with border-focus glows, clean answer blocks.
* **Rebuild or Polish**: Polish.

### D. Check-In (`/check-in`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Standard cards are flat and lack visual progression.
* **Layout Problems**: Card margins are misaligned.
* **Typography Problems**: Subtext lacks secondary font contrast.
* **Spacing Problems**: Timeline elements are squished.
* **Mobile Problems**: Content stacks awkward without clear divider borders.
* **What Must Be Fixed**: Apply `.arova-page--compact` wrapper, clean timeline lists, and glass cards.
* **Rebuild or Polish**: Polish.

### E. Couple Profile (`/couple-profile`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Simple form elements look like generic prototype boxes.
* **Layout Problems**: Form floats on the left with empty space on the right.
* **Typography Problems**: Form labels are raw text without uppercase spacing treatments.
* **Spacing Problems**: Inputs have tight padding.
* **Mobile Problems**: Inputs run off screen bounds.
* **What Must Be Fixed**: Reorganize inputs into a cohesive grid card layout, style inputs with custom borders.
* **Rebuild or Polish**: Polish.

### F. Profile View (`/profile`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: The photo grid categories icons are stacked awkwardly. Level progress bars lack micro-animations. Editable details have flat borders.
* **Layout Problems**: Squeezed inside page container, leaving gaps on wider layout widths.
* **Typography Problems**: Subtitle text is muted and lacks hierarchy.
* **Spacing Problems**: Avatar margin overlaps text elements.
* **Mobile Problems**: Grid items shrink too small on narrow screens.
* **What Must Be Fixed**: Full rebuild of profile to match Instagram visual grids, SVG progress rings, preset avatar lists, and scrolling ledger rows.
* **Rebuild or Polish**: Full Rebuild.

### G. Mood Room (`/mood`)
* **Visual Quality Score**: 6 / 10
* **Main Problems**: Card selection faces look static.
* **Layout Problems**: Center-aligned form elements feel cramped.
* **Typography Problems**: Labels lack modern hierarchy.
* **Spacing Problems**: Emoji grid is squished.
* **Mobile Problems**: Buttons wrap in weird positions.
* **What Must Be Fixed**: Polished card selectors, smooth scale hover effects, note areas.
* **Rebuild or Polish**: Polish.

### H. Chat Room (`/chat`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Messages pane expands without boundaries. Composer bar is not fixed at the bottom.
* **Layout Problems**: Composer overlaps sidebar or floats above margins.
* **Typography Problems**: Speech bubbles text uses default font weight.
* **Spacing Problems**: Avatar bubbles are too close to messages.
* **Mobile Problems**: Screen overflows horizontally due to input elements.
* **What Must Be Fixed**: Full rebuild of chat container height, fixed position composer bar, message bubble tails.
* **Rebuild or Polish**: Full Rebuild.

### I. Memories & Reasons & Letters
* **Visual Quality Score**: 6 / 10
* **Main Problems**: Cards are basic, and Letters envelope seals look flat.
* **Layout Problems**: Pages are too narrow.
* **Typography Problems**: Inconsistent heading serif tags.
* **Spacing Problems**: Items sit too close together.
* **Mobile Problems**: Cards stack into one column too early.
* **What Must Be Fixed**: Standardize to shared cards grids, visual countdown cards, and responsive max-widths.
* **Rebuild or Polish**: Polish.

### J. Music Room (`/music`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Playlist lists look like flat text directories. Record disk looks like simple circle.
* **Layout Problems**: Squeezed.
* **Typography Problems**: Track text overlaps list borders.
* **Spacing Problems**: Track grid has weak spacing.
* **Mobile Problems**: Disk player runs off screen borders.
* **What Must Be Fixed**: Full rebuild to modern music-app interface (player pane, playlist grid, filters).
* **Rebuild or Polish**: Full Rebuild.

### K. Challenges & Future Boards
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Action buttons are unstyled HTML buttons.
* **Layout Problems**: Inconsistent layout grids.
* **Typography Problems**: Cards header sizes are small.
* **Spacing Problems**: Cards have uneven gutters.
* **Mobile Problems**: Cards stack with no bottom margin spacing.
* **What Must Be Fixed**: Uniform page wrapper columns, styled checkboxes, status pills.
* **Rebuild or Polish**: Polish.

### L. Custom Spaces (`/custom-sections`)
* **Visual Quality Score**: 4 / 10
* **Main Problems**: Looks raw. Slot indicators are basic text percentages. Checklist rows are unstyled checkbox tags.
* **Layout Problems**: Split panels are cramped.
* **Typography Problems**: Emojis presets are raw buttons.
* **Spacing Problems**: Workspace panel is misaligned.
* **Mobile Problems**: Sidebar indexes overlap details.
* **What Must Be Fixed**: Full rebuild of pricing selectors, slot gauges, emoji presets, and checklist items.
* **Rebuild or Polish**: Full Rebuild.

### M. Settings Page (`/settings`)
* **Visual Quality Score**: 4 / 10
* **Main Problems**: Extremely squeezed on the right side. Backup utility links are mixed directly with visual configurations.
* **Layout Problems**: Floating block format.
* **Typography Problems**: Section titles are simple labels.
* **Spacing Problems**: Theme grid cards are small.
* **Mobile Problems**: Squeezed inputs.
* **What Must Be Fixed**: Full rebuild of settings layout (two-column desktop tabbed panels, swatches theme grid).
* **Rebuild or Polish**: Full Rebuild.

### N. Admin Dashboard (`/admin`)
* **Visual Quality Score**: 3 / 10
* **Main Problems**: Debug-looking HTML grids. Simple cards. Raw activity table logs.
* **Layout Problems**: Cramped.
* **Typography Problems**: Inconsistent sizes.
* **Spacing Problems**: No breathing room.
* **Mobile Problems**: Logs overflow.
* **What Must Be Fixed**: Full rebuild of stats boxes, developer flags, limits matrix, and logs feeds.
* **Rebuild or Polish**: Full Rebuild.

---

## 2. Public Screens (No Sidebar)

### A. Landing Page (`/`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Static hero lights, missing real website footer sections.
* **Layout Problems**: Scroll sections end abruptly.
* **Typography Problems**: Hero title lacks hierarchy.
* **Spacing Problems**: Margin gaps are unequal.
* **Mobile Problems**: Nav blocks stack awkwardly.
* **What Must Be Fixed**: Parallax scroll lightings, about/privacy FAQ accordion, roadmaps, complete website footer.
* **Rebuild or Polish**: Full Rebuild.

### B. Plans & Gifted Pages (`/plans`, `/plans/gifted`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Card features lists are simple bullet lists. Code validation feedback is plain.
* **Layout Problems**: Content sits too high.
* **What Must Be Fixed**: Polished card columns, glassmorphism containers.
* **Rebuild or Polish**: Polish.

### C. Auth Setup Pages (`/auth`, `/verify-account`, `/profile-setup`, `/pairing-choice`)
* **Visual Quality Score**: 5 / 10
* **Main Problems**: Password strength is raw text; inputs have flat borders. Setup status redirection is loose.
* **Layout Problems**: Form sizes are unequal.
* **What Must Be Fixed**: Form validation controls, custom inputs, password checks.
* **Rebuild or Polish**: Polish.
