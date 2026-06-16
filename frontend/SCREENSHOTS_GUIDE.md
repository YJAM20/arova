# Arova Screenshot Capture & Visual Showcase Guide

To showcase Arova effectively in your GitHub portfolio, follow these recommended guidelines to capture clean, high-quality, and professional screenshots.

---

## 📐 Recommended Settings

* **Resolution / Viewport**:
  * **Desktop Screenshots**: `1280x800` or `1440x900` (provides high detail without being overly large).
  * **Mobile Screenshots**: `375x812` (iPhone X format) or `390x844` (iPhone 13 format).
* **Browser Chrome**: Use the browser's developer tools in responsive mode or use extension overlays to capture *viewport only* (hide browser address bars, tabs, extensions, and OS taskbars).
* **Themes to Showcase**: Capture screenshots using the default **Dark Romantic** theme first, or provide a gallery showing **Soft Pink** and **Midnight Stars** theme variations to highlight custom theme switching capabilities.

---

## 🚀 How to Generate Screenshots Automically

1.  **Start the Local Server**:
    Ensure the Angular app is served locally:
    ```bash
    npm run start
    ```
2.  **Execute the Screenshot Runner**:
    In another terminal, execute the visual audit pipeline:
    ```bash
    npm run visual:audit
    ```
    This launches headless Playwright Chromium and saves screenshots of the 20 routes directly to `visual-audit/latest/`.

---

## 📸 Recommended Screenshots & Order

Showcase these screens in the following order in your `README.md` or portfolio project page:

| Order | Page / Screen | Key Visual Elements to Highlight | Viewport |
|---|---|---|---|
| 1 | **Landing Page** | The elegant brand heading, the cards explaining layout, plans buttons, and stars background. | Desktop |
| 2 | **Plans Page** | Three subscription tier cards (Free, Pro, Platinum) showcasing styling alignment. | Desktop |
| 3 | **Universe Home** | Personalized greeting ("Welcome back, Partner A."), stats counter grid, shortcut button layout, and Quiet Moments card. | Desktop |
| 4 | **Chat Room** | Left and right speech bubble alignments, time stamps, chat disclosure copy, and the SignalR connection status pill. | Desktop |
| 5 | **Memories Grid** | Multiple memory cards containing visibilities, dates, mood indicators, and tags. | Desktop |
| 6 | **Reasons Grid** | Highlighted Today's Reason card with react buttons, grid layout, and the selection overlay modal. | Desktop |
| 7 | **Letters Vault** | Envelope folded card visual flaps, lock icons, open countdown status pills, and wax seal indicators. | Desktop |
| 8 | **Settings Panel** | Swatch-based theme selector preview grid, space mode radio toggles, selects, sensory checkbox list, and the profile info sidebar card. | Desktop |
| 9 | **Mobile Layout** | Show the collapse sidebar header, mobile-responsive grid, and centered cards. | Mobile |

---

## 🧼 Best Practices for Capturing

1. **Use Clean Test Data**:
   * Use the Local Demo credentials (`owner` or `partner`) which seed clean, default memories and letters.
   * Do not write real personal, private, or romantic names during setup.
   * Avoid screenshots with user emails visible (mask or replace them in DevTools if necessary).
2. **Hide Hover and Focus States**: Ensure your mouse cursor is moved off-screen (or hide it) before capturing, unless you are deliberately demonstrating button hover states.
3. **Optimizing Images**:
   * Save screenshots in **PNG** format for perfect glassmorphism transparency, then compress them using tools like `TinyPNG` to keep repository sizes small.
   * Alternative: Convert screens to WebP format for fast load times on GitHub.
4. **DevTools Adjustments**: If fonts or margins look too small at high resolutions, use browser zoom (`110%` or `120%`) to enlarge text and cards slightly before capturing.
