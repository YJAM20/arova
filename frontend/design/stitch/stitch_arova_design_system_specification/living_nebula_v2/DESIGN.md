---
name: Living Nebula v2
colors:
  surface: '#161120'
  surface-dim: '#161120'
  surface-bright: '#3c3648'
  surface-container-lowest: '#100c1b'
  surface-container-low: '#1e1929'
  surface-container: '#221d2d'
  surface-container-high: '#2d2738'
  surface-container-highest: '#383243'
  on-surface: '#e8def5'
  on-surface-variant: '#dac0c9'
  inverse-surface: '#e8def5'
  inverse-on-surface: '#332e3f'
  outline: '#a28a93'
  outline-variant: '#544249'
  surface-tint: '#ffafd3'
  primary: '#ffafd3'
  on-primary: '#620040'
  primary-container: '#f472b6'
  on-primary-container: '#6d0047'
  inverse-primary: '#a43073'
  secondary: '#e9c254'
  on-secondary: '#3d2f00'
  secondary-container: '#ae8d21'
  on-secondary-container: '#352800'
  tertiary: '#cec1de'
  on-tertiary: '#352c43'
  tertiary-container: '#a69ab6'
  on-tertiary-container: '#3b3249'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd8e7'
  primary-fixed-dim: '#ffafd3'
  on-primary-fixed: '#3d0026'
  on-primary-fixed-variant: '#85145a'
  secondary-fixed: '#ffe08d'
  secondary-fixed-dim: '#e9c254'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#584400'
  tertiary-fixed: '#ebddfb'
  tertiary-fixed-dim: '#cec1de'
  on-tertiary-fixed: '#1f182d'
  on-tertiary-fixed-variant: '#4c435a'
  background: '#161120'
  on-background: '#e8def5'
  surface-variant: '#383243'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style
The design system for this premium cinematic sanctuary is built on a narrative of celestial intimacy. It evokes the vastness of deep space contrasted with the warmth of a shared sanctuary. The target audience is couples seeking an ultra-premium, private, and immersive experience.

The visual style is **Premium Glassmorphism** set against an **Obsidian** backdrop. It utilizes high-fidelity background blurs, luminous gradients, and subtle motion to create a sense of depth and exclusivity. The interface should feel like a portal—ethereal yet structured—combining high-tech precision with the romantic elegance of cinematic storytelling.

## Colors
The palette is rooted in a deep, near-black "Obsidian" to maximize contrast for cinematic content. 

- **Primary Accent (Neon Pink):** Used for calls to action, active states, and energetic highlights.
- **Secondary Accent (Gold Dust):** Reserved for premium status, rewards, and intimate "parchment" interactions.
- **Surface Strategy:** Use the Midnight Nebula hex for container backgrounds. Borders should remain extremely subtle to allow the glass effect to define shapes rather than hard lines.

## Typography
The system employs a sophisticated pairing of **Playfair Display** for high-impact editorial headings and **Inter** for functional, highly legible body copy.

Headlines should utilize slightly tighter letter-spacing to enhance the cinematic feel. For Arabic (RTL), ensure that the font weights of the secondary font maintain visual parity with the Inter weights. Labels and captions should often use the "Gold Dust" accent color or high-opacity white to maintain hierarchy without cluttering the screen.

## Layout & Spacing
This design system uses a **Fluid Grid** with generous safe areas to simulate a cinematic widescreen experience.

- **Desktop:** 12-column grid with 64px outer margins and 24px gutters.
- **Mobile:** 4-column grid with 16px outer margins and 16px gutters.
- **RTL Support:** All layout logic is built on logical properties (`padding-inline-start`, `margin-inline-end`). Icons used for navigation (arrows) must be flipped in Arabic contexts, while cinematic playback controls remain LTR standard.

## Elevation & Depth
Depth is created through transparency and blur rather than traditional shadows.

1.  **The Void (Base):** Obsidian background `#03010b`.
2.  **Nebula Layer (Mid):** Semi-transparent surfaces with a `24px` backdrop-filter blur on desktop. On mobile, this is reduced to `8px` for performance.
3.  **Luminous Layer (High):** Elements at high elevation use a `1px` inner border of `rgba(255, 255, 255, 0.15)` and a subtle "glow" (outer drop shadow with 20px blur, 10% opacity of the primary accent color).

## Shapes
Shapes are generous and fluid, reflecting a "soft" and welcoming environment. 

The standard radius is **16px (md)** for primary cards and buttons. Smaller components like input fields or tags use **8px (sm)**. High-level layout sections or featured hero cards use **24px (lg)** or **36px (xl)** to create a distinct, modern silhouette.

## Components

### Glass Cards
Cards are the primary container. They feature a `0.08` opacity white border and a `backdrop-filter: blur(24px)`. On hover, they should exhibit a subtle radial gradient glow that follows the cursor, using a faint Neon Pink or Gold Dust tint.

### Parchment Letter Envelopes
A specialized component for private messaging. These ignore the obsidian/glass theme and instead use a warm, high-contrast light-cream background with a subtle paper texture. They use `Playfair Display` for the content to evoke a traditional, handwritten letter feel.

### Status Pills
Small, fully rounded (pill-shaped) indicators. They use a low-opacity background of the accent color (e.g., `rgba(244, 114, 182, 0.2)`) and a solid-colored label for maximum legibility.

### Buttons
- **Primary:** Solid Neon Pink with white text. High-glow on hover.
- **Secondary:** Ghost style with a thin white border and Gold Dust text.
- **Tertiary:** Borderless, using Gold Dust text with an underline on hover.

### Input Fields
Inputs should be dark with a 1px border. On focus, the border transitions to Neon Pink and the background slightly lightens to the Midnight Nebula hue.