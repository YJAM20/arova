# Arova Experience Upgrade v1 - Release Notes

This release upgrades the frontend user experience, visual design, and interactive components of Arova, establishing a premium, calm, warm, and private atmosphere. 

---

## 1. Design & Typography Foundation
* **Theme variables**: Integrated dynamic CSS custom variables (`--arova-*`) that bind to the user's active theme. Theme switching updates accents, backgrounds, border glows, and borders smoothly across the workspace.
* **Ambient Styling**: Replaced sharp borders and plain colors with soft alpha borders, glassmorphic blur filters, custom font families (`Cormorant Garamond`), and clean, spacious layouts.

---

## 2. Reusable Shared UI Components
Implemented six standalone UI components under `src/app/shared/components/`:
* `ArovaPageHeaderComponent`: Consolidated headers with planet-eyebrows and action slots.
* `ArovaCardComponent`: Replaced general cards with glassmorphic cards supporting hover translation, soft glow, and alphabetic borders.
* `ArovaEmptyStateComponent`: Uniform placeholder for blank screens.
* `ArovaStatusPillComponent`: Color-coded pill markers for categorization and system status.
* `ArovaSectionHeaderComponent`: Clean dividers for dashboard sections.
* `ArovaLoadingStateComponent`: Minimal loading indicators with custom micro-copies.

---

## 3. Key Upgrades

### Internal Layout & Navigation
* **Space Mode Status**: A dynamic space indicator badge in the sidebar displays whether the user is in `Local Mode` or `API Mode`.
* **Sidebar Details**: Added celestial stars (`✦`) and elegant left-border glow highlights to the active route navigation item.

### Universe Dashboard (`/universe`)
* **Personalized Greeting**: Greets users based on user profile display names with context-sensitive headings ("Welcome back to your shared universe" vs "Welcome home to your shared universe").
* **Sensory Statistics**: Displays card counts for Memories, Reasons, and Letters.
* **Quiet Moments**: Embeds emotional prompts to encourage connection.

### Chat UX (`/chat`)
* **Message Bubbles**: Clean, color-coded speech bubbles separating owner messages (right, accent bg) and partner messages (left, soft dark bg).
* **Connection Status**: Renders real-time SignalR connection status pills.
* **Composer Improvements**: The chat input field supports auto-growing textarea, `Enter` to send, and `Shift+Enter` for multi-line breaks. Added clean local mode warnings.

### Memories, Reasons, & Letters Pages
* **Grid Density**: Shifted listings to multi-column responsive grids, elevating grid density while preserving readability.
* **Envelope Aesthetic**: Styled Letters Vault items as sealed envelopes with wax seals and folded flap graphics.
* **Modal Overlay**: The "Show a random reason" widget displays random details inside a beautiful focused overlay modal instead of expanding inline.

### Settings & Profile Page
* **Structured Settings**: Organized configuration categories with section headers. Added clean active state pills for selected modes.
* **Copywriting Refinements**: Applied a mature, warm, and secure tone throughout the interface (e.g., "Secure couple-scoped chat. End-to-end encryption is planned, not active yet.").
