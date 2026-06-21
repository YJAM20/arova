# Project PRD: Arova — The Living Nebula

## 1. Executive Summary
**Arova** is a premium, private digital sanctuary designed exclusively for two people. It transcends traditional communication apps by providing a shared "Universe" — a non-linear, architectural space for memories, shared goals (planets), intimate letters, and relationship analytics. The product uses a "Living Nebula" design system, characterized by architectural intimacy, deep glassmorphism, and procedural motion to create a sense of security and cinematic immersion.

---

## 2. Product Vision & Goals
- **Vision**: To create a home made of starlight for the world's most vulnerable and beautiful shared moments.
- **Primary Goal**: Facilitate intentional connection through shared rituals and secure digital preservation.
- **Target Audience**: Couples seeking a private, high-fidelity alternative to public social media or fragmented messaging apps.
- **Key Differentiator**: "Architectural Intimacy" — a design philosophy where every pixel feels intentional, private, and secure.

---

## 3. Core Product Pillars
### I. The Spatial Universe (Navigation & Hub)
- **Concept**: Moving away from standard lists to a spatial canvas where relationship modules (Memory Reels, Health Analytics, Goal Planets) coexist in a dynamic environment.
- **Core Component**: The `SpatialCanvas` — a non-linear dashboard with procedural backgrounds.

### II. Intentional Rituals (Engagement)
- **Daily Questions**: Shared reflection prompts to deepen understanding.
- **Check-in Room**: A focused space for mood synchronization and presence.
- **The Observatory**: A goal-tracking system where shared aspirations are visualized as evolving planets.

### III. The Living Archive (Memory & Lore)
- **The Vault**: An editorial-grade reading and writing experience for future-dated letters.
- **Kinetic Memories**: A cinematic gallery for shared photos and milestones.
- **Activity Timeline**: A chronological "Lore" of the relationship's history.

### IV. Sanctuary Integrity (Security)
- **Security Center**: A technical control center for managing encryption protocols, biometric sync, and data residency.
- **Sanctuary Admin**: High-level metrics for relationship health and system stability.

---

## 4. User Journeys
### Onboarding: The Ritual of Entry
1. **The Invitation**: A cinematic, personalized invite sent from one partner to another.
2. **The Welcome**: A multi-step "Onboarding Ritual" including setting intentions and choosing a "Sanctuary Anchor."
3. **The Alignment**: A celebration of the "Third Entity" — the bond created when two orbits align.

### Daily Use: The Pulse of Connection
1. **The Check-in**: Partners sync their current moods and presence status.
2. **The Reflection**: Answering a daily question or sending a "Whisper" (voice note).
3. **The Exploration**: Reviewing the status of shared planets or adding to the Memory Reel.

---

## 5. Technical Requirements
### Frontend Architecture (Angular)
- **Framework**: Angular 18+ with SCSS.
- **State Management**: Local Mode (client-side encryption/storage) and API Mode (cloud synchronization).
- **Design Tokens**: Centralized `--arova-*` CSS variables for the Living Nebula theme.

### Design Standards (The Living Nebula v2)
- **Glassmorphism**: `backdrop-filter: blur(24px)` with `1px` white/5% borders.
- **Typography**: `Playfair Display` (Serif/Emotional) and `Geist` (Sans/Technical).
- **Motion**: 60fps procedural WebGL backgrounds (Nebula Shader) with CSS-based "Expanding Horizon" reveals.
- **Color Palette**: 
  - Surface: `#051424` (Deep Space)
  - Primary: `#dfe0ff` (Luminous Blue)
  - Secondary: `#f6be38` (Amber Accent)

---

## 6. Implementation Roadmap
### Phase 1: Foundations (P0)
- Global Design Tokens implementation.
- App Shell (Navigation Rail + Global Shader Background).
- System Screens (Loading, Error, 404).

### Phase 2: Core Hubs (P1)
- Spatial Dashboard (Universe).
- Authentication & Onboarding Rituals.
- Sanctuary Admin & Security Center.

### Phase 3: Intimate Spaces (P2)
- The Vault (Letters & Memories).
- The Observatory (Planets & Goals).
- Relationship Analytics Dashboard.

---

## 7. Risks & Mitigations
- **Performance**: High use of `backdrop-filter` may cause lag on mobile. *Mitigation: Implement "Low Power Mode" fallbacks and reduced blur for mobile devices.*
- **Complexity**: Spatial layouts are harder to make responsive. *Mitigation: Use a strict "Stack-on-Mobile" logic for absolute-positioned desktop modules.*
- **Privacy**: The feeling of security is paramount. *Mitigation: Visual cues for "Quantum Encryption" and "Active Sync" must be persistent.*

---

## 8. Success Metrics
- **Engagement**: Completion rate of Daily Rituals.
- **Retention**: Growth of the "Shared Lore" (Memories and Letters added).
- **Sentiment**: User perception of the sanctuary as a "private" and "cinematic" space.
