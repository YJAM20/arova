# Frontend Research Notes - Arova Experience

These notes capture competitive analysis, design inspiration, and layout principles applied to the final polish of the Arova frontend. Arova is positioned as a **private shared sanctuary for couples**—avoiding generic corporate SaaS tropes, childish layouts, or overly romantic clutter.

---

## 1. References & Inspiration Reviewed

### Product & Flow Inspiration
* **Paired / Agapé**:
  * *Strengths*: Simple onboarding, daily relationship triggers, conversational tone, low-friction interactions.
  * *Key Takeaways*: Kept questions and setup clean. We should keep onboarding questions conversational and emphasize emotional pacing without feeling childish.
* **Reflectly / Journaling Apps**:
  * *Strengths*: Clean editorial serif typography, calm color palettes, deep shadows, card-focused layouts, premium empty states.
  * *Key Takeaways*: Emphasized Cormorant Garamond for display fonts and high-contrast styling variables. Glassmorphic overlays feel lightweight and intimate.
* **Signal / Secure Messengers**:
  * *Strengths*: Clear sender vs. receiver bubble alignments, simple compose inputs, live connection feedback, no false security claims.
  * *Key Takeaways*: Clean distinction between owner (right, theme accent soft background) and partner (left, surface background) messages.

### UI Pattern Inspiration (Mobbin, Godly, Awwwards)
* **Glassmorphic Cards**: Used subtle translucent panels (`rgba(255, 255, 255, 0.03)` to `0.08`) combined with thin borders (`1px solid rgba(255, 255, 255, 0.1)`) and backdrops. Keeps layouts spacious and light.
* **Celestial & Dark Themes**: Sleek dark space aesthetics (similar to linear.app or raycast.com) mixed with warm tones.
* **Mobile-First Layouts**: Easy-to-tap inputs, clean responsive wrappers, and a sliding drawer/sidebar menu system.

---

## 2. Useful Design Ideas Found & Applied

1. **Space Identity Hero Section**: Introducing the user space name (`coupleSpaceName`) alongside personalized greetings. It frames the dashboard as a mutual space, not a generic account dashboard.
2. **Warm Theme Fallbacks**: Replacing hardcoded green values (`rgba(55, 88, 63, 0.18)`) with theme-aware background rules using CSS variable variables (e.g., color-mix with `var(--arova-accent)` or `var(--arova-surface-elevated)`).
3. **Structured Sealed Letters (Letters Vault)**: Standardizing letter previews to look like sealed physical mail envelopes with a custom css flap and sealed wax effect.
4. **Focused Modal Overlay**: Displaying random daily reasons inside an explicit focused screen overlay modal to avoid layout shift when expanding cards.

---

## 3. Ideas Rejected & Why

* **Complex Multi-Step Interactive Graphs**: Rejected because Arova is about a *quiet* place. Cluttered metrics or complex charts create performance tracking stress rather than connection.
* **Custom Avatar Uploaders with Heavy Libraries**: Avoided adding crop/zoom dependencies. Simple text URL avatars are cleaner, lightweight, and match existing API models.
* **Intense Shimmering Gradients or Loud Animations**: Large moving highlights create distraction and layout jank on mobile. Focused on smooth fade-ins and subtle scale transitions.

---

## 4. Final Design & Improvement Plan

### Pages Requiring Visual Refinement
* **Landing Page (`/`)**: Hero typography, button layouts, and spacing could feel more spacious and premium.
* **Chat Room (`/chat`)**: Improve bubble contrast across themes, composition layout details, and mobile-width composer sizing.
* **Letters / Reasons / Memories**: Ensure components utilize `arova-card`, `arova-status-pill`, and `arova-empty-state` correctly, with consistent card borders and hover effects.
* **Settings & Onboarding Forms**: Clean up inputs, text contrasts, and ensure focus highlights match active theme accents.

### Pages to Keep Mostly Unchanged
* **Auth Page (`/auth`)**: Already functional and stable. Needs only alignment check and subtle visual separation of Local demo credentials.
* **Verification / Pairing**: Keep the workflow identical. Clean up validation messages.
