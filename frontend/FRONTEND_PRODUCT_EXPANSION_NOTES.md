# Arova Product Expansion v2 - Release Notes

This release introduces the **Arova Experience Upgrade v2**, adding rich relationship features, gamified level progressions, custom spaces, custom themes, and an upgraded developer creator console dashboard.

---

## 1. Celestial Planets System & Daily Rituals
* **Planet Orbit Mapping**: Added a dedicated `/planets` view mapping 10 distinct relationship planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Sun, Moon, Aurora).
* **Seeded Random Daily Selection**: A daily calendar-seeded algorithm guarantees both partners see the exact same planet daily, promoting synchronous communication.
* **Daily Ritual Tasks**: Each planet includes customized couple questions and checklists (e.g., sharing boundaries on Mars or gratitude on Sun).
* **Progress Rewards**: Completing the daily checklist awards relationship points and updates the level progression ledger.

---

## 2. Gamified Level Progress & Connection Ledger
* **RelationshipPointsService**: Handles points tracking, login/activity streaks, and level ranks (Spark, Warmth, Orbit, Bond, Constellation, Gravity, Eclipse, Eternal Orbit).
* **Activity Triggers**: Points are awarded dynamically across Arova tools:
  * Creating a memory (+20 pts)
  * Depositing a letter (+25 pts)
  * Answering daily questions (+15 pts)
  * Completing daily planet rituals (+50 pts)
  * Sending chat messages (+2 pts)
  * Logging mood check-ins (+10 pts)
* **Connection Ledger**: Renders a scrolling transaction feed of recent points earned on the user profile page.

---

## 3. Instagram-Like Memory Profile Grid
* **Visual Grid Layout**: Replaced the basic profile card with an Instagram-inspired profile view at `/profile`.
* **Stats Counters**: Showcases interactive counts for Memories, Letters, Reasons, and the current streak.
* **Progress Meter**: Visualizes the active points progression bar towards the next rank.
* **3-Column Photo Grid**: Displays shared memories in a standard grid. If a memory doesn't contain an image, it renders a custom category-matched emoji with a warm background gradient.
* **Focused Detail Modal**: Clicks on grid cards open a premium detail card containing descriptions, moods, and direct links to managing the item.
* **Cosmic Avatar Presets**: Integrates a picker of 6 celestial Unsplash default images (Cosmos, Nebula, Aurora, Orbit, Eclipse, Warm Soul) alongside custom image URL entry.

---

## 4. Custom Spaces & Subscription Levels
* **Bucket List Custom Directories**: A new child route `/custom-sections` allows partners to create custom spaces (e.g. Travel List, Inside Jokes, Shared Dreams).
* **Simulated Pricing Tier Constraints**:
  * **Free Tier**: Restricts space creation to 1 custom section.
  * **Pro Tier**: Restricts space creation to 5 custom sections.
  * **Platinum Tier**: Allows up to 20 custom sections.
* **Limit Enforcement & UI Warnings**: Disables the creation controls when the current simulated tier slots are fully utilized, showing helpful tooltips. Clicks on Pro/Platinum badges simulate upgrades instantly in Local Mode.
* **Checklist Items**: Supports dynamic item checklists with custom reward logs (+5 pts for addition, +10 pts for completion).

---

## 5. 20 High-Quality CSS Themes
* **Accents Swatches**: Expanded `src/styles/_themes.scss` and settings to offer 20 premium CSS themes.
* **Modern Themes Added**: Includes Cyber-Retro, Cyber-Cyber, Solar-Warm, Solar-Hot, Solar-Chill, Forest-Light, Forest-Dark, Ice-Muted, Ice-Chill, Midnight-Soft, Midnight-Deep, Dusk-Warm, Dawn-Quiet, Lavender-Dream, and Emerald-Quiet.
* **Visual Previews**: Swatch buttons on `/settings` render gradient previews of each palette.

---

## 6. Upgraded Creator Console (`/admin`)
* **Analytics charts**: Grid cards display visibility breakdowns (visible vs private memories, locked letters, secret reasons, custom spaces count).
* **Developer Feature Flags**: Simulates toggle rules for developer settings saved in local mode:
  * *Developer Mode Logs* (console verbose output)
  * *Simulate Slow Connection* (1.5s delay)
  * *Bypass Content Filters* (disable keyword checks)
  * *Simulated Maintenance Mode*
* **Activity Logger**: A simulated logger log panel captured developer actions. Users can click "Simulate Event" to test warning alerts, security sweeps, and server synchronization logs.
* **Limits Matrix**: Displays comparative columns for Free vs Pro vs Platinum parameters.
