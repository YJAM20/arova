# STITCH VISUAL FIDELITY GAP AUDIT

This document performs a strict design audit comparing Arova's current implementation against the **Living Nebula v2** design system guidelines.

---

## I. Public Routes

### 1. Landing Page (`/`)
* **Stitch Target Summary**: Cinematic hero background, scroll reveal sections, About, Privacy, FAQ, coming soon Roadmap, footer block, and clear CTA.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Complete website sections (About, Privacy, FAQ, Roadmap, Footer). Lacks visual scroll reveal effects.
* **Missing Background/Icon/Motion Elements**: Breathing CSS mesh background is present, but needs a more visible ambient starry universe overlay. Lacks micro-interactions on the FAQ accordion.
* **Layout Problems**: Center text blocks have too much width on high-resolution monitors.
* **Components That Still Look Raw**: Plain text FAQ and feature list.
* **What Must Be Implemented Now**: A complete premium Landing Page structure with smooth scroll reveals, FAQ accordion, privacy disclaimer, roadmap timeline, and a floating starry sky.
* **What Can Wait**: Complex interactive WebGL mesh shaders (CSS gradients are preferred for performance).
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [landing-page.component.html](./src/app/features/public/pages/landing-page/landing-page.component.html)
  * [landing-page.component.scss](./src/app/features/public/pages/landing-page/landing-page.component.scss)

### 2. Auth / Sign In Page (`/auth`)
* **Stitch Target Summary**: Premium split screen layout. Left side: branding/cinematic cosmic visual; Right side: login/signup form. Strong validation states, password strength indicator blocking weak entries, format validation, and demo login options.
* **Current Quality**: 6/10
* **Missing Stitch Elements**: Premium split layout. Currently, the form is centered and basic.
* **Missing Background/Icon/Motion Elements**: Stars overlay is missing. Submit state has no smooth transit loading.
* **Layout Problems**: Center box feels isolated on desktop.
* **Components That Still Look Raw**: Password strength meter and social provider placeholders (Google/Apple) look like simple buttons.
* **What Must Be Implemented Now**: Split layout (Cinematic Left / Interactive Right), stars backgrounds, password validation block (score >= 3 / Good), and email validation.
* **What Can Wait**: Authentic Google/Apple SSO connection (remains simulated as requested).
* **Risk Level**: Medium (Auth guard interaction).
* **Files Likely Needing Changes**:
  * [public-auth.component.html](./src/app/features/auth/pages/public-auth/public-auth.component.html)
  * [public-auth.component.scss](./src/app/features/auth/pages/public-auth/public-auth.component.scss)

### 3. Plans Page (`/plans`)
* **Stitch Target Summary**: Three-column glass card grid for tier limits, showing Free, Pro, and Platinum tiers with transparent highlights.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Glass module system alignment.
* **Missing Background/Icon/Motion Elements**: Lacks glowing hover accents on plan selection cards.
* **Layout Problems**: Narrow layout grid.
* **Components That Still Look Raw**: Pricing buttons and limits lists.
* **What Must Be Implemented Now**: Fully glassmorphic card elements, custom hover scales, and clear upgrade triggers.
* **What Can Wait**: Staging payment integrations (strictly mock checks).
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [plans-page.component.scss](./src/app/features/public/pages/plans-page/plans-page.component.scss)

### 4. Gifted Plan Page (`/plans/gifted`)
* **Stitch Target Summary**: Simple card layout displaying gifted code configuration and registration redirects.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Premium glass layouts.
* **Missing Background/Icon/Motion Elements**: Star transition glow.
* **Layout Problems**: Slightly awkward centering.
* **Components That Still Look Raw**: The gift card component.
* **What Must Be Implemented Now**: Glass card wrap and button polish.
* **What Can Wait**: True coupon codes validation.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [gifted-plan-page.component.scss](./src/app/features/public/pages/gifted-plan-page/gifted-plan-page.component.scss)

### 5. Verify Account Page (`/verify-account`)
* **Stitch Target Summary**: Verification tab system (Email/Phone), visual code validation slots, loading overlays.
* **Current Quality**: 6/10
* **Missing Stitch Elements**: Visual slots for OTP code input.
* **Missing Background/Icon/Motion Elements**: Verification orbital load ring.
* **Layout Problems**: Simple form alignment.
* **Components That Still Look Raw**: Inputs and tabs.
* **What Must Be Implemented Now**: Style code input with separate letter spacing or slots, style phone verification notice cleanly as a glass card, and apply the glass system.
* **What Can Wait**: Real SMS pairing gateway (remain mock warning).
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [verify-account.component.html](./src/app/features/auth/pages/verify-account/verify-account.component.html)
  * [verify-account.component.scss](./src/app/features/auth/pages/verify-account/verify-account.component.scss)

### 6. Onboarding Questions (`/onboarding/questions`)
* **Stitch Target Summary**: Step-by-step cosmic question slider with progress tracker and star ratings.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Premium step indicators.
* **Missing Background/Icon/Motion Elements**: Star transit glow.
* **Layout Problems**: Height shifts when transitioning between questions.
* **Components That Still Look Raw**: Textareas and navigation buttons.
* **What Must Be Implemented Now**: Styled glass textareas, progress meter polish, and step indicator animations.
* **What Can Wait**: Procedural animations.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [onboarding-questions.component.scss](./src/app/features/onboarding/pages/onboarding-questions/onboarding-questions.component.scss)

### 7. Profile Setup (`/profile-setup`)
* **Stitch Target Summary**: Initial avatar picker grid and detail setups.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Premium avatar circles.
* **Missing Background/Icon/Motion Elements**: Glow on selected item.
* **Layout Problems**: Flat layout grid.
* **Components That Still Look Raw**: Input forms.
* **What Must Be Implemented Now**: Visual avatar grids with hover glows and structured sections.
* **What Can Wait**: File upload mechanisms (mock URLs are fine).
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [profile-setup.component.scss](./src/app/features/profile/pages/profile-setup/profile-setup.component.scss)

### 8. Pairing Choice (`/pairing-choice`)
* **Stitch Target Summary**: Twin option panel (Create Code / Join Code) with glowing orbital connectors.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Glass panels.
* **Missing Background/Icon/Motion Elements**: Pulse connectors.
* **Layout Problems**: Flat stack on mobile.
* **Components That Still Look Raw**: Code cards.
* **What Must Be Implemented Now**: High-fidelity glass modules and custom hover buttons.
* **What Can Wait**: Live socket pairing syncing.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [pairing-choice.component.scss](./src/app/features/couple/pages/pairing-choice/pairing-choice.component.scss)

---

## II. Internal Routes

### 1. Universe Hub (`/universe`)
* **Stitch Target Summary**: Absolute-positioned orbital spatial nodes, hovering nebula dust, pulse indicators.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Detailed orbit visual connections.
* **Missing Background/Icon/Motion Elements**: Moving space dust particles, visible neon color glows.
* **Layout Problems**: Spatial layout collapses slightly awkwardly on narrow desktops.
* **Components That Still Look Raw**: Subtitle and metric counts.
* **What Must Be Implemented Now**: Complete visual mesh background, orbital nodes with custom SVGs, and card entry scales.
* **What Can Wait**: Full WebGL support.
* **Risk Level**: Medium (GPU load).
* **Files Likely Needing Changes**:
  * [universe-home.component.html](./src/app/features/universe/pages/universe-home/universe-home.component.html)
  * [universe-home.component.scss](./src/app/features/universe/pages/universe-home/universe-home.component.scss)

### 2. Planets (`/planets`)
* **Stitch Target Summary**: Celestial orbit system, ritual checkbox cards, questions panels, map grid.
* **Current Quality**: 9/10
* **Missing Stitch Elements**: Advanced orbit lines.
* **Missing Background/Icon/Motion Elements**: Breathing planet visual atmospheres.
* **Layout Problems**: Desktop visual layout is solid, but needs better alignment.
* **Components That Still Look Raw**: Textareas for answers and cards.
* **What Must Be Implemented Now**: Complete visual nebula background, unique planet card custom themes (Venus, Sun, Neptune etc.), and custom textareas.
* **What Can Wait**: WebGL shaders.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [planets-home.component.html](./src/app/features/planets/pages/planets-home/planets-home.component.html)
  * [planets-home.component.scss](./src/app/features/planets/pages/planets-home/planets-home.component.scss)

### 3. Daily Questions (`/daily-questions`)
* **Stitch Target Summary**: Reflection prompts, comparative response columns.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Clear vertical spacing and category icons.
* **Missing Background/Icon/Motion Elements**: Soft gradient separators.
* **Layout Problems**: Flat double column.
* **Components That Still Look Raw**: Cards and text inputs.
* **What Must Be Implemented Now**: Visual split response cards (Your Response / Partner's Response), custom buttons, and nebula details.
* **What Can Wait**: Real-time notifications.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [daily-questions-page.component.html](./src/app/features/daily-questions/pages/daily-questions-page/daily-questions-page.component.html)
  * [daily-questions-page.component.scss](./src/app/features/daily-questions/pages/daily-questions-page/daily-questions-page.component.scss)

### 4. Check-In (`/check-in`)
* **Stitch Target Summary**: Emotional sliders, rating boxes, historical cards.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Custom scale buttons and glow ratings.
* **Missing Background/Icon/Motion Elements**: Star highlights on active values.
* **Layout Problems**: Columns look static.
* **Components That Still Look Raw**: Standard scale buttons.
* **What Must Be Implemented Now**: Upgraded 1-5 rating selectors with active gradient highlights and hover scales, custom glass textareas.
* **What Can Wait**: Statistical charting libraries.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [check-in-page.component.html](./src/app/features/check-in/pages/check-in-page/check-in-page.component.html)
  * [check-in-page.component.scss](./src/app/features/check-in/pages/check-in-page/check-in-page.component.scss)

### 5. Couple Profile (`/couple-profile`)
* **Stitch Target Summary**: Shared identity card showing relationship dates, shared completions, and joint settings.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Visual separator glow lines.
* **Missing Background/Icon/Motion Elements**: Star decorations.
* **Layout Problems**: Flat lists.
* **Components That Still Look Raw**: Edit modals and inputs.
* **What Must Be Implemented Now**: Polished glass card wrappers, visual input setups.
* **What Can Wait**: Live socket synchronization.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [couple-profile-page.component.html](./src/app/features/couple-profile/pages/couple-profile-page/couple-profile-page.component.html)
  * [couple-profile-page.component.scss](./src/app/features/couple-profile/pages/couple-profile-page/couple-profile-page.component.scss)

### 6. Profile (`/profile`)
* **Stitch Target Summary**: Instagram-like personal layout. Header, avatar with glowing progression ring, streak badges, highlights row, point scores, and a photo grid.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Relationship length indicator, clean points highlights, handle representation.
* **Missing Background/Icon/Motion Elements**: Stars backgrounds.
* **Layout Problems**: Stats column occupies too much vertical space.
* **Components That Still Look Raw**: Ledger list and edit profiles forms.
* **What Must Be Implemented Now**: Relationship duration calculations, highlights row (Memories count, letter seals, reasons counts, tasks counts) styled as circular badges, and custom list grids.
* **What Can Wait**: Mature content filter integrations.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [profile-view.component.html](./src/app/features/profile/pages/profile-view/profile-view.component.html)
  * [profile-view.component.scss](./src/app/features/profile/pages/profile-view/profile-view.component.scss)

### 7. Mood Room (`/mood`)
* **Stitch Target Summary**: Radial-glow emotive cards, selection visual changes, recent history overlays.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Glass mood grid.
* **Missing Background/Icon/Motion Elements**: Emotional color shades.
* **Layout Problems**: Left/Right double column shifts.
* **Components That Still Look Raw**: Response textareas.
* **What Must Be Implemented Now**: Styled emotion selectors with hover color states matching each mood (e.g. Amber for Loved, Blue for Distant, etc.), custom textarea layout, and partner responsive boxes.
* **What Can Wait**: Mood notification triggers.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [mood-room.component.html](./src/app/features/mood/pages/mood-room/mood-room.component.html)
  * [mood-room.component.scss](./src/app/features/mood/pages/mood-room/mood-room.component.scss)

### 8. Chat Room (`/chat`)
* **Stitch Target Summary**: Speech bubbles, composer panel, local mode warning pills, disclosures.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Composer heights, scroll padding.
* **Missing Background/Icon/Motion Elements**: Loading shimmer.
* **Layout Problems**: Screen height cuts off composer on short viewports.
* **Components That Still Look Raw**: Quick emoji buttons.
* **What Must Be Implemented Now**: Upgraded bubble heights, fixed composer position that doesn't clip, styled warning panels.
* **What Can Wait**: Full E2EE support.
* **Risk Level**: Medium (Vite viewport errors).
* **Files Likely Needing Changes**:
  * [chat-room.component.html](./src/app/features/chat/pages/chat-room/chat-room.component.html)
  * [chat-room.component.scss](./src/app/features/chat/pages/chat-room/chat-room.component.scss)

### 9. Memories List (`/memories`)
* **Stitch Target Summary**: Grid layout of memory blocks with category pills, favorite stars, and photo covers.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Visual grids and glass styling.
* **Missing Background/Icon/Motion Elements**: Interactive cards.
* **Layout Problems**: Category spacing.
* **Components That Still Look Raw**: Detail cards and add button.
* **What Must Be Implemented Now**: Standardize to card grids, apply global glass card rules.
* **What Can Wait**: Real picture upload backend.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [memories-list.component.html](./src/app/features/memories/pages/memories-list/memories-list.component.html)
  * [memories-list.component.scss](./src/app/features/memories/pages/memories-list/memories-list.component.scss)

### 10. Reasons List (`/reasons`)
* **Stitch Target Summary**: Constellation map of reasons, daily highlight cards, random picker overlays.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Complete glass system.
* **Missing Background/Icon/Motion Elements**: Custom star accents.
* **Layout Problems**: Double row grid.
* **Components That Still Look Raw**: Modal views.
* **What Must Be Implemented Now**: Premium random-card overlay and daily highlighted reason card styling.
* **What Can Wait**: Constellation rendering library.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [reasons-list.component.html](./src/app/features/reasons/pages/reasons-list/reasons-list.component.html)
  * [reasons-list.component.scss](./src/app/features/reasons/pages/reasons-list/reasons-list.component.scss)

### 11. Letters Vault (`/letters`)
* **Stitch Target Summary**: Editorial sealed envelope graphics with wax seal elements.
* **Current Quality**: 9/10
* **Missing Stitch Elements**: Complete envelope dimensions.
* **Missing Background/Icon/Motion Elements**: Wax seal details.
* **Layout Problems**: Envelope sizes cut off.
* **Components That Still Look Raw**: Seal badges.
* **What Must Be Implemented Now**: Standardize cards to envelopes, style 3D wax seals, and letter category tabs.
* **What Can Wait**: Encrypted vaults.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [letters-vault.component.html](./src/app/features/letters/pages/letters-vault/letters-vault.component.html)
  * [letters-vault.component.scss](./src/app/features/letters/pages/letters-vault/letters-vault.component.scss)

### 12. Music Room (`/music`)
* **Stitch Target Summary**: Vintage room layout, player card with rotating disc, tracklists.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Clean disc styling.
* **Missing Background/Icon/Motion Elements**: Luminous pulse play states.
* **Layout Problems**: Split panels.
* **Components That Still Look Raw**: Playlist grid.
* **What Must Be Implemented Now**: Re-skin rotating CD visual to look like a premium cosmic vinyl record with radial gradients, style track list and cards with glass overlays.
* **What Can Wait**: Live audio syncing.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [music-room.component.html](./src/app/features/music/pages/music-room/music-room.component.html)
  * [music-room.component.scss](./src/app/features/music/pages/music-room/music-room.component.scss)

### 13. Challenges (`/challenges`)
* **Stitch Target Summary**: Couple challenge progression panels, reward stars, completion grids.
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Progress card overlays.
* **Missing Background/Icon/Motion Elements**: Custom stars.
* **Layout Problems**: Plain columns.
* **Components That Still Look Raw**: Cards and lists.
* **What Must Be Implemented Now**: Upgraded challenge cards with progress bar meters, reward tags, and completion check grids.
* **What Can Wait**: Social sharing modules.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [challenges-home.component.html](./src/app/features/challenges/pages/challenges-home/challenges-home.component.html)
  * [challenges-home.component.scss](./src/app/features/challenges/pages/challenges-home/challenges-home.component.scss)

### 14. Future Board (`/future`)
* **Stitch Target Summary**: Board-inspired columns (Bucket List, Shared Dreams, Travel Plans).
* **Current Quality**: 7/10
* **Missing Stitch Elements**: Segmented columns.
* **Missing Background/Icon/Motion Elements**: Star tags.
* **Layout Problems**: Standard vertical flex rows.
* **Components That Still Look Raw**: Add input box.
* **What Must Be Implemented Now**: Columns styled as distinct glass board panels, item grids with card hover scale animations, custom input form fields.
* **What Can Wait**: Collaborative boards.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [future-board.component.html](./src/app/features/future/pages/future-board/future-board.component.html)
  * [future-board.component.scss](./src/app/features/future/pages/future-board/future-board.component.scss)

### 15. Custom Sections (`/custom-sections`)
* **Stitch Target Summary**: Space configurations, slots limit cards, animated meter, details panel.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Section settings, upgrade CTAs.
* **Missing Background/Icon/Motion Elements**: Luminous progress meter bars.
* **Layout Problems**: Modals cut off.
* **Components That Still Look Raw**: Add modal input layout.
* **What Must Be Implemented Now**: Scrollable modals, slots meter with gradient progress bar fills, upgrade buttons.
* **What Can Wait**: Staged checkout paths.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [custom-sections-home.component.html](./src/app/features/custom-sections/pages/custom-sections-home/custom-sections-home.component.html)
  * [custom-sections-home.component.scss](./src/app/features/custom-sections/pages/custom-sections-home/custom-sections-home.component.scss)

### 16. Settings (`/settings`)
* **Stitch Target Summary**: General, Appearance, Profile/Account tabs, theme preset swatches, settings checkboxes.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Separation grids.
* **Missing Background/Icon/Motion Elements**: Luminous preset highlights.
* **Layout Problems**: Compact layout can feel crowded.
* **Components That Still Look Raw**: Input selectors.
* **What Must Be Implemented Now**: Fully glassmorphic tabs structure, styled swatches grids, preferences sliders/toggles.
* **What Can Wait**: Advanced client-side configurations.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [settings-page.component.html](./src/app/features/settings/pages/settings-page/settings-page.component.html)
  * [settings-page.component.scss](./src/app/features/settings/pages/settings-page/settings-page.component.scss)

### 17. Admin Dashboard (`/admin`)
* **Stitch Target Summary**: Wide dashboard, cinemative headers, status strip, KPI cards, plan distribution layout, product health meters, flags dashboard, activity timeline, security checklists.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Plan distribution chart, security checklist panel, storage/budget meter.
* **Missing Background/Icon/Motion Elements**: Pulse indicators.
* **Layout Problems**: Columns display list is short.
* **Components That Still Look Raw**: System Health panel.
* **What Must Be Implemented Now**: Complete Sanctuary Admin Dashboard features (KPI cards row, system flags widgets, security checklist panel, storage budget indicators, activity timeline).
* **What Can Wait**: Live stats reporting hook.
* **Risk Level**: Low.
* **Files Likely Needing Changes**:
  * [admin-dashboard.component.html](./src/app/features/admin/pages/admin-dashboard/admin-dashboard.component.html)
  * [admin-dashboard.component.scss](./src/app/features/admin/pages/admin-dashboard/admin-dashboard.component.scss)

---

## III. System States

### 1. App Loading Screen
* **Stitch Target Summary**: Center rotating orbit overlay, synchronized shared resonance branding copies.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Stars particle backdrops.
* **Missing Background/Icon/Motion Elements**: Rotating stars.
* **Layout Problems**: Fixed center alignment.
* **What Must Be Implemented Now**: Full-screen glass loader, rotating orbit nodes, tagline animations.
* **Files Likely Needing Changes**:
  * [arova-app-loading-screen.component.ts](./src/app/shared/components/arova-app-loading-screen/arova-app-loading-screen.component.ts)

### 2. Backend Offline Screen
* **Stitch Target Summary**: Orbital signal lost icon, action buttons.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: E2E check copy ("Space Link Offline").
* **Files Likely Needing Changes**:
  * [backend-offline.component.ts](./src/app/shared/components/backend-offline/backend-offline.component.ts)

### 3. 404 Screen
* **Stitch Target Summary**: 404 Lost in Space icon, action buttons.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: E2E check copy ("Lost in Space").
* **Files Likely Needing Changes**:
  * [not-found.component.ts](./src/app/shared/components/not-found/not-found.component.ts)

### 4. Empty/Skeleton States
* **Stitch Target Summary**: Standardized empty states, shimmer cards.
* **Current Quality**: 8/10
* **Missing Stitch Elements**: Premium empty icon sets.
* **Files Likely Needing Changes**:
  * [arova-empty-state.component.ts](./src/app/shared/components/arova-empty-state/arova-empty-state.component.ts)

---

## IV. Core Architecture Requirements

### 1. Global Background System
We must replace plain backgrounds with a visible radial gradient breathing mesh and starry particle system.
- **Background component**: Create/update `ArovaBackgroundComponent` or configure `src/styles/_backgrounds.scss`.
- **Z-Index Layering**: Main Background (0) -> Ambient glow (5) -> Content layers (10) -> Navigation sidebar (50) -> Overlays & Modals (100).

### 2. Icon System
Core routes must not use simple emojis for nav rail links.
- **Link Icons**: Create/embed inline SVG icons for: Universe, Planets, Questions, Checkin, Profile, Mood, Chat, Memories, Reasons, Letters, Music, Challenges, Future, Custom, Settings, Admin, Loading, Offline, and Success/Error.

### 3. NavRail Finalization
- 80px desktop Glass sidebar.
- Integrated active state indicators (glow outline).
- Separator line and accessible labels.
- Partner details / Status badges at bottom.

