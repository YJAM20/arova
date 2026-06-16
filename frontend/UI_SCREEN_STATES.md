# Arova UI Screen States Documentation

This document outlines the visual states, loading conditions, error layouts, and content validations for the Arova application.

---

## 1. System Loading States
- **App Loading Screen**: Centered dynamic orbit rings with a rotating star canvas. Displays messages like `"Aligning your universe..."` or `"Synchronizing shared resonance."`
- **Page Loading State**: Simple spinning sparks with a text placeholder inside `.main-content`.
- **Skeleton Cards**: Shimmering glass card shapes used on memories and letters pages before data is fetched.

---

## 2. System Error States
- **Backend Offline Page (`/offline`)**:
  - Displays `"Signal Lost."`
  - Re-establishes connections using standard endpoints with retry triggers.
  - Buttons: `Retry Connection`, `Enter Offline Vault` (loads Local Mode).
- **Not Found Page (`/404`)**:
  - Displays `"Lost in Orbit."` and coordinates copy.
  - Button: `Return to Sanctuary` (redirects to `/universe`).

---

## 3. Empty States
- **Empty Chat Room**: Displays `"Silence is a constellation. Begin a new transmission to your partner."`
- **Empty Memories**: Displays `"No memories saved yet. Capture your first shared moment."`

---

## 4. Input Validation & Visual States
- **Sign In / Create Account**:
  - Fields are trimmed on submission.
  - Validation messages clear when the user switches tabs or corrects inputs.
  - Submits are disabled if required inputs are missing or password strength is insufficient.
- **Password Strength Indicator**:
  - Renders a multi-colored strength bar (Red for weak, Yellow for okay, Green for strong).
  - Minimum allowed score to create an account is `3` (Good/Strong). Blocked on the client side.
