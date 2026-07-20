# Saheli — Design System

## Design direction

Warm, calm, human — not clinical-sterile, not "cute pastel period app." A grounded warm-neutral base with a confident primary accent (terracotta) and a calm secondary (sage). Generous whitespace, soft rounded cards, no harsh grid lines.

## Color tokens

| Token | Role | Light | Dark |
|---|---|---|---|
| `sand` | Warm neutral base (50–900) | `#FBF8F4` → `#3A2F22` | inverted |
| `clay` | Primary accent (terracotta / deep rose) | `#FBEEEA` → `#361813` | inverted |
| `sage` | Secondary accent (calm green) | `#EEF4F0` → `#13211A` | inverted |
| `success` | Positive | `#4F7A4A` | — |
| `warning` | Caution (non-alarmist) | `#B8843A` | — |
| `danger` | Seek-care | `#A8443A` | — |
| `info` | Informational | `#3E6B82` | — |

Dark mode is class-based (`html.dark`), toggled via `ThemeContext`, persisted to `localStorage`. The body has a 400ms color transition so the theme switch animates rather than flashing.

## Typography

- **Display** (headings): Fraunces — warm, slightly literary serif.
- **Body / UI**: Plus Jakarta Sans — friendly, legible, modern.
- Weights: 400 (body), 500 (UI emphasis), 600 (headings/buttons), 700 (large display).
- Line spacing: 150% body, 120% headings.

## Spacing & radius

- 8px spacing system (Tailwind defaults).
- Cards: `rounded-2xl` (1.25rem), buttons `rounded-xl` (0.875rem), chips `rounded-full`.
- Shadows: `shadow-card` (resting), `shadow-soft` (buttons), `shadow-lift` (hover/toasts).

## Motion principles

Motion should feel like **breathing, not bouncing** — smooth, grounded, reassuring.

- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for all transitions (exported as `easeOut`/`easeInOut` in `src/animations/variants.ts`).
- **Durations**: micro-interactions 150–250ms, page/section transitions 300–500ms, nothing >600ms except ambient drift.
- **Reduced motion**: every animation respects `prefers-reduced-motion` via a global CSS rule plus a `useReducedMotionPref` hook for JS-driven animations (count-up, seek-care banner).
- **No bouncy/spring overshoot** on health data. The only spring is the contact-form success check (low-stakes delight).

### Shared variants (`src/animations/variants.ts`)

`fadeUp`, `fadeIn`, `scaleIn`, `staggerContainer`, `staggerContainerSlow`, `pageTransition`, `modalTransition`, `drawerTransition`, `backdropTransition`, `seekCareTransition`, `chipReveal`, `listItem`, plus `viewportFade`/`viewportStagger` helpers for scroll-triggered reveals.

### Animation map

| Surface | Animation |
|---|---|
| Landing hero | Staggered headline/subhead/CTA + ambient gradient drift |
| Feature grid / persona cards | Scroll-triggered staggered fade+rise |
| Route transitions | Cross-fade + slight y-shift (same app-wide) |
| Cycle Tracker | Animated month slide, day-tap selection ring, calm save toast |
| Symptom log | Chip press feedback; **seek-care banner: slow fade+scale, never alarming** |
| AI Assistant | Typing indicator, token-by-token stream, staggered source chips, smooth auto-scroll |
| Dashboard | Count-up for cycle day, staggered card entrance |
| Insights | Recharts animated draw-in + filter transitions |
| Theme toggle | Sun↔moon morph icon + smooth color transition |
| Forms | Inline error shake + color, success state |
| Modals / drawers | Slide+fade with backdrop fade |

### The seek-care banner — the most important restraint

`SeekCareBanner` enters with `seekCareTransition`: a 500ms gentle fade + scale(0.98→1) + 8px rise. No red flash, no shake, no pulse. The icon (`HeartPulse`) + text provide non-color signaling. It is triggered by the safety layer in the assistant and by red-flag symptom selection.

## Accessibility

- Full keyboard operability; focus-visible ring on all interactive elements.
- WCAG AA contrast in both themes.
- Non-color signaling for red-flag alerts (icon + text, not just color).
- `prefers-reduced-motion` honored globally.
- Real `aria-label`s, `aria-pressed`, `aria-live` on streaming/seek-care.
