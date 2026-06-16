# Frontend Critical Audit - Arova Product Experience

This audit highlights critical UX gaps, verification bottlenecks, visual weaknesses, and layout issues in the current Arova frontend.

---

## 1. Login/Register & Form Validation Bugs

* **Weak Password Enforcements**: 
  * Currently, the auth page displays password strength but allows users to submit weak passwords. This must be blocked programmatically (require at least score >= 3 or label "Good").
* **Loose Email Validation**:
  * Simple text email inputs can proceed without strong format validations. Email syntax validation must be strict, rejecting obviously invalid formats.
* **Loading and Error Feedback**:
  * Submit buttons remain active while requests are in flight. We must disable forms and display loading states during authentication actions.

---

## 2. Routing & Setup Status Bugs

* **Setup Redirection Loops**:
  * After registering or logging in, routing is not coordinated cleanly, occasionally leaving users stranded or causing blank screens if onboarding or couple pairing is incomplete.
  * *Correction Rule*: 
    * If not verified -> redirect to `/verify-account`
    * Else if onboarding incomplete -> redirect to `/onboarding/questions`
    * Else if profile incomplete -> redirect to `/profile-setup`
    * Else if no couple paired -> redirect to `/pairing-choice`
    * Else -> redirect to `/universe`

---

## 3. Sidebar & Layout Issues

* **Sidebar Scroll Cut-Off**:
  * On pages with long scrolling content, the navigation sidebar ends early, creating a broken visual line. The sidebar must stretch exactly to `100vh` and remain sticky while the main container scrolls.
* **Useless/Developer Nav Sections**:
  * Navigation headers like `Backup` and `API Account` are displayed prominently in the sidebar. These should be removed or hidden from primary user views to maintain a clean couples space.

---

## 4. UI Pages below Product Quality

* **Landing Page (`/`)**:
  * Lacks complete website sections: About Arova, Privacy, FAQ, coming soon roadmap, and contact feedback boxes.
  * Hero background feels static; it needs an animated celestial/universe feeling.
* **Moods Room (`/mood`)**:
  * Lacks expressive visual emotion selectors. It needs beautiful, interactive face emoji cards (Loved, Distant, Tired, Calm, Grateful, Excited).
* **Music Room (`/music`)**:
  * Feels generic instead of looking like a modern music-app UI with track lists, mock player bars, and mood playlists.
* **Settings Page (`/settings`)**:
  * Visual presentation is flat and contains developer backups links. Needs clean segmentation.

---

## 5. Recommended Implementation Plan

1. **Security & Auth validation**:
   * Block weak passwords.
   * Coordinate route checks after login/register.
2. **Landing Page Upgrade**:
   * Add orbit/planetary animations.
   * Add about, privacy, FAQ, and footer blocks.
3. **Sidebar Navigation Flexing**:
   * Fix height styling and hide backup/API navigation items.
4. **Chat & UI Polish**:
   * Adjust bubbles, composers, and scrollings.
5. **Mood & Music Revamps**:
   * Upgrade mood selector face cards.
   * Design a premium music player card interface.
