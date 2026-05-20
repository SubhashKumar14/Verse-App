# Design System

## Theme

Adaptive: genuine light and dark, both first-class. Dark is the primary emotional register — code-adjacent neutrals, low-chroma tinted surfaces, high contrast for text. Light is calm and spare, not clinical white.

Color scheme follows `prefers-color-scheme`. No manual toggle yet.

**Scene (dark):** a developer composing a thought at their desk at 10pm, single monitor, quiet room. The UI recedes; the text breathes.

**Scene (light):** the same person at a coffee shop mid-morning, natural light, writing a reflection before the day accelerates.

---

## Color

**Strategy:** Restrained — tinted neutrals with a single indigo-violet accent (hue 275). Accent covers ≤10% of any surface. No pure `#000` or `#fff`. OKLCH throughout.

### Light theme

| Token | Value | Role |
|---|---|---|
| `--bg` | `oklch(0.985 0.006 275)` | Page background |
| `--surface` | `oklch(0.995 0.004 275)` | Card / panel surface |
| `--surface-2` | `oklch(0.972 0.008 275)` | Raised inputs, hover tint |
| `--text` | `oklch(0.235 0.02 275)` | Primary text |
| `--muted` | `oklch(0.47 0.015 275)` | Secondary / metadata text |
| `--border` | `oklch(0.88 0.01 275)` | Default border |
| `--border-strong` | `oklch(0.82 0.014 275)` | Hover / focus border |
| `--accent` | `oklch(0.62 0.17 275)` | Primary accent (indigo-violet) |
| `--accent-ink` | `oklch(0.98 0.006 275)` | Text on accent background |
| `--accent-soft` | `color-mix(in oklab, accent 12%, bg)` | Tinted accent surface |
| `--accent-border` | `color-mix(in oklab, accent 28%, border)` | Accent-tinted border |
| `--danger` | `oklch(0.58 0.19 25)` | Destructive / error |
| `--success` | `oklch(0.62 0.16 145)` | Success |
| `--warning` | `oklch(0.7 0.14 85)` | Warning |
| `--info` | `oklch(0.66 0.13 215)` | Informational |

### Dark theme overrides (`prefers-color-scheme: dark`)

| Token | Value |
|---|---|
| `--bg` | `oklch(0.16 0.01 275)` |
| `--surface` | `oklch(0.19 0.012 275)` |
| `--surface-2` | `oklch(0.24 0.014 275)` |
| `--text` | `oklch(0.93 0.01 275)` |
| `--muted` | `oklch(0.72 0.01 275)` |
| `--border` | `oklch(0.28 0.01 275)` |
| `--border-strong` | `oklch(0.34 0.012 275)` |
| `--accent` | `oklch(0.72 0.16 275)` |
| `--accent-ink` | `oklch(0.16 0.01 275)` |

Semantic soft variants (`--danger-soft`, `--success-soft`, `--warning-soft`, `--info-soft`) are computed via `color-mix(in oklab, token 12–16%, bg)` in both themes.

---

## Typography

```
--font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …
--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, …
```

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title | 1.7–1.875rem | 600 | `tracking-tight` |
| Heading | 1.125rem | 600 | — |
| Body | 1rem / 0.9375rem | 400 | `leading-relaxed` |
| Subheading / label | 0.875rem | 500–600 | Uppercase, wide tracking |
| Muted / meta | 0.875rem | 400 | `--muted` color |
| Small / timestamp | 0.75rem | 400 | — |

Body max line length: 65ch (enforced by `max-w-2xl` column). Scale ratio: ≥1.25 between adjacent levels.

---

## Spacing & Layout

**Page widths:**
- Narrow column (feed, forms): `max-w-2xl` (672px)
- Wide shell (main layout): `max-w-6xl`
- Horizontal padding: `px-4 sm:px-6`
- Vertical padding: `py-8` – `py-10`

**Feed rhythm:** non-uniform vertical spacing is intentional — `space-y-4` between posts, `mb-6` after composer, `mb-10` at section breaks. Variation creates reading rhythm; uniform spacing creates monotony.

**Layout structure:** single-column feed center, optional `w-56` sidebar hidden below `md`. No nested cards. No container wrapping everything.

---

## Elevation & Surfaces

Surfaces are separated by border color and chroma difference — not drop shadows.

| Level | Treatment |
|---|---|
| Base page | `--bg`, no border |
| Cards / panels | `--surface` + `border-[--border]` + `shadow-[0_1px_0_0_rgba(0,0,0,0.04)]` |
| Raised / active | `--surface-2`, no border by default |
| Overlay / scrim | `backdrop-blur-sm` + `--bg` 55% via `color-mix` |

**Border radius scale:**
- `rounded-xl` — inputs, small interactive elements
- `rounded-2xl` — cards, panels, modals
- `rounded-3xl` — feature / hero panels
- `rounded-full` — buttons, avatars, pill badges

---

## Components

### Buttons

| Variant | Style |
|---|---|
| Primary | Filled `--accent` bg, `--accent-ink` text, `rounded-full`, `hover:brightness-95` |
| Secondary | `--surface` bg, border, `rounded-full`, hover darkens border and bg |
| Ghost | No bg, muted text, `rounded-full`, hover adds `--surface-2` fill |
| Icon | `p-2 rounded-full`, muted → text on hover |
| Danger | `--danger-soft` bg, `--danger` text, danger-tinted border |

All buttons: `disabled:opacity-50 disabled:cursor-not-allowed`, `focus-visible:ring-2 ring-[--ring]`.

### Post Card

No outer shadow — border + surface separation only. Structure:
- **Author row:** 36px circular avatar (letter initial, `--surface-2` bg), username (`font-medium`), timestamp (`--muted`, `text-xs`). Gap: `2.5`.
- **Content:** `text-[15px] leading-relaxed whitespace-pre-wrap`. No clamp; posts are short by design.
- **Action row:** separated from content by `border-t border-[--border]`. Actions: icon + count, `--muted` at rest, `--text` on hover. Like active: `--danger`.

### Forms / Inputs

- Input: `rounded-xl`, `--surface` bg, `border-[--border]`, `focus-visible:ring-2 ring-[--ring]`, `focus:border-[--border-strong]`
- Textarea: same as input, `resize-none`
- Label: `text-xs font-semibold uppercase tracking-wide --muted`, `mb-1.5`
- Submit: full-width `rounded-full` primary button, `mt-2`
- Error message: `--danger` text, `text-xs`, `mt-1.5`

### Navigation

**Top navbar:** sticky, `backdrop-blur`, `h-16`, `border-b`. Logo + brand name left, nav icon links right. `max-w-6xl` container.

**Nav links:** `p-2 rounded-full`, muted at rest, accent + `--accent-soft` bg on active.

**Sidebar:** `w-56`, hidden below `md`. Link items: `px-3 py-2.5 rounded-xl`, muted → accent on hover with `--accent-soft` bg. Active: accent text + `--accent-soft` bg, `font-semibold`.

**Mobile:** bottom tab bar with `pb-safe` for iOS home indicator clearance.

### Tabs

Underline indicator only — no filled pill tabs. `border-b border-[--border]` container, `gap-6` between items.
- **Active:** `border-b-2 border-[--accent]`, accent text, `font-semibold`
- **Inactive:** muted text, `border-b-2 border-transparent`, hover to `--text`

### Avatars

Circular. Letter-initial fallback: centered initial, `--muted` text, `--surface-2` bg, `border-[--border]`.

| Context | Size |
|---|---|
| Comment | `w-7 h-7` (28px) |
| Post | `w-9 h-9` (36px) |
| User card / suggestion | `w-10 h-10` (40px) |
| Profile header | `w-16 h-16` (64px) |

### Follow Button

`rounded-full px-4 py-1.5 text-xs font-semibold`.
- **Follow:** `--accent` bg, `--accent-ink` text
- **Following:** `--surface` bg, `--border`, hover shifts text to `--danger` (destructive affordance on hover only)

### Archives Card

`--warning-soft` bg, dashed border tinted to warning. Restore action: `--info-soft` pill, info-tinted border.

### Toaster

Theme-aware via CSS vars: `--toast-bg`, `--toast-fg`, `--toast-border`. Border radius: `14px`.

### Modals / Overlays

Overlay: `fixed inset-0 backdrop-blur-sm` + 55% `--bg` scrim, `z-40`.
Modal: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`, `--surface`, `border`, `rounded-2xl`, `shadow-xl`, `z-50`, `max-w-sm`.

### Badges / Pills

`text-[11px] font-medium px-2 py-0.5 rounded-full --accent-soft bg --accent text --accent-border border`.

### Empty States

Centered, `py-12`. Icon: `text-3xl --accent`. Message: `text-sm font-medium --muted`.

---

## Motion

- **Default transition:** `duration-200`, `ease-out`
- **Fast (hover on nav/sidebar):** `duration-150`
- **Properties animated:** `color`, `background-color`, `border-color`, `opacity`, `box-shadow` — never layout properties (`width`, `height`, `padding`, `margin`)
- **No bounce, no elastic.** Ease-out only.
- **`prefers-reduced-motion`:** all `transition-duration` and `animation-duration` collapse to `0.001ms`. Iteration count: 1. Scroll behavior: `auto`.

---

## Iconography

Library: `react-icons` v5. Icons are decorative support — always paired with a visible label or an explicit `aria-label` on icon-only controls. Icon alone is never the sole signal for meaning.

---

## Accessibility Patterns

- Focus ring: `focus-visible:ring-2 ring-[--ring]` (accent at 45–55% opacity) — visible but not aggressive
- Ring offset: `outline-offset: 2px`
- `-webkit-tap-highlight-color: transparent` on interactive elements
- Color is never the only state signal: active nav uses both color and bg tint; error uses both color and label
- Touch targets: minimum 44px on mobile for all interactive elements (enforced via `p-2` icon buttons and `py-2.5` nav links)
- Scrollbar: custom, tinted, theme-aware — 8px, `border-radius: 999px`