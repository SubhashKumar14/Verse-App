# Design System — Coffee Cream

## Theme

Adaptive: genuine light and dark, both first-class. Dark is the primary emotional register: deep espresso tones, warm neutral surfaces, cream text. Light is calm and spare, not clinical white but warm parchment.

Theme follows `prefers-color-scheme` by default with manual override via Settings. Toggle stored in `localStorage`. Applied via `data-theme` attribute on `<html>`.

**Scene (dark):** a developer composing a thought at their desk at 10pm, single monitor, quiet room. The warm interface feels like writing by candlelight. Not clinical, not harsh.

**Scene (light):** the same person at a coffee shop mid-morning, natural light, warm wood tones around them. The parchment-cream interface blends with the environment.

---

## Color

**Strategy:** Restrained: warm tinted neutrals with a single caramel/coffee accent. No pure `#000` or `#fff`. Hex values throughout for reliability.

### Dark theme (primary)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#11100F` | Page background (near-black warm) |
| `--surface` | `#1B1613` | Card / panel surface (espresso) |
| `--surface-2` | `#241E19` | Raised inputs, hover tint |
| `--text` | `#F5EFE8` | Primary text (warm cream) |
| `--muted` | `#B7A99A` | Secondary / metadata text |
| `--border` | `rgba(255,255,255,0.06)` | Default border |
| `--border-strong` | `rgba(255,255,255,0.12)` | Hover / focus border |
| `--accent` | `#C98B5A` | Primary accent (caramel) |
| `--accent-active` | `#E6B98F` | Active / hover accent (light caramel) |
| `--accent-ink` | `#11100F` | Text on accent background |
| `--accent-soft` | `rgba(201,139,90,0.1)` | Tinted accent surface |
| `--accent-border` | `rgba(201,139,90,0.2)` | Accent-tinted border |
| `--danger` | `#C45B4A` | Destructive / error (warm terracotta) |
| `--success` | `#6B9B6E` | Success (sage green) |
| `--warning` | `#C4933A` | Warning (amber) |
| `--info` | `#6B8FAE` | Informational (warm blue-grey) |

### Light theme

| Token | Value | Role |
|---|---|---|
| `--bg` | `#F8F2EA` | Page background (warm parchment) |
| `--surface` | `#FFF9F4` | Card / panel surface (warm white) |
| `--surface-2` | `#F0E8DE` | Raised inputs, hover tint |
| `--text` | `#2B211B` | Primary text (espresso dark) |
| `--muted` | `#7A685B` | Secondary / metadata text |
| `--border` | `rgba(0,0,0,0.06)` | Default border |
| `--border-strong` | `rgba(0,0,0,0.12)` | Hover / focus border |
| `--accent` | `#B56A3A` | Primary accent (darker caramel) |
| `--accent-active` | `#D99A6C` | Active / hover accent |
| `--accent-ink` | `#FFF9F4` | Text on accent background |

Semantic soft variants (`--danger-soft`, `--success-soft`, etc.) computed as low-opacity tints of the semantic color.

---

## Typography

```
--font-sans: "Inter", "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
```

| Role | Size | Weight | Notes |
|---|---|---|---|
| Page title | 1.75-2rem | 600 | `tracking-tight`, `leading-tight` |
| Heading | 1.125rem | 600 | `tracking-tight` |
| Body / Post content | 1rem (16px) | 400 | `leading-[1.7]`, comfortable reading |
| Subheading / label | 0.6875rem (11px) | 600 | Uppercase, `tracking-[0.08em]` |
| Muted / meta | 0.875rem | 400 | `--muted` color |
| Small / timestamp | 0.75rem | 400 | Tabular nums |

Body max line length: 65ch (enforced by `max-w-2xl` column). Scale ratio: ≥1.25 between adjacent levels. Letter-spacing on body: `-0.011em` for tighter, more editorial feel.

---

## Spacing & Layout

**Page widths:**
- Narrow column (feed, forms): `max-w-2xl` (672px)
- Wide shell (main layout): `max-w-[1400px]`
- Horizontal padding: `px-4 md:px-6 lg:px-8`

**Layout structure:** Three-column on desktop:
- Left rail: `w-52` navigation with logo, links, logout
- Center feed: fluid `max-w-2xl`
- Right sidebar: `w-72` contextual content

Mobile: single column with bottom tab navigation, mobile-only slim top bar.

**Feed rhythm:** Posts separated by bottom border (`border-b`), no card boxing. Generous `py-5` per post. Composer gets `mb-8` below it. Non-uniform spacing creates reading rhythm.

---

## Elevation & Surfaces

Surfaces are separated by color difference and subtle borders, not drop shadows.

| Level | Treatment |
|---|---|
| Base page | `--bg`, no border |
| Cards / panels | `--surface` + `border-[--border]` |
| Raised / active | `--surface-2` |
| Overlay / scrim | `backdrop-blur-sm` + `--bg` 60% opacity |

**Border radius scale:**
- `rounded-lg` (8px) — buttons, inputs, cards, panels
- `rounded-xl` (12px) — larger cards, image containers
- `rounded-full` — avatars, badge pills

---

## Components

### Buttons

| Variant | Style |
|---|---|
| Primary | Filled `--accent` bg, `--accent-ink` text, `rounded-lg`, `hover:opacity-90` |
| Secondary | `--surface` bg, border, `rounded-lg`, hover darkens border and bg |
| Ghost | No bg, muted text, `rounded-lg`, hover adds `--surface-2` fill |
| Icon | `p-2 rounded-lg`, muted → text on hover |
| Danger | `--danger-soft` bg, `--danger` text, danger-tinted border |

All buttons: `disabled:opacity-40 disabled:cursor-not-allowed`, `focus-visible:ring-2 ring-[--ring]`.

### Post Card

Borderless divider model: items separated by bottom border, not boxed cards.
- **Author row:** 40px circular avatar, username + timestamp with · separator. Gap: 3.
- **Content:** `text-[16px] leading-[1.7] whitespace-pre-wrap`. Comfortable reading size.
- **Action row:** No top border, just spacing. Actions: icon + count, muted at rest, accent on hover. Like active: `--danger`.

### Composer

- Softer `--surface` background with border
- 3-row textarea, transparent bg, no border at rest
- Placeholder: "What's on your mind..."
- Action row: photo button + char count left, Post button right

### Forms / Inputs

- Input: `rounded-lg`, `--surface-2` bg, `border-[--border]`, warm focus ring
- Textarea: same as input, `resize-none`
- Label: `text-[11px] font-semibold uppercase tracking-[0.06em]`, muted color

### Navigation

**Left sidebar (desktop):** Logo at top, navigation links, logout at bottom. Active: accent text + accent-soft bg, font-semibold.

**Mobile top bar:** Slim `h-14`, logo + avatar. Hidden on desktop.

**Mobile bottom nav:** Tab bar with warm accent active state and dot indicator.

### Tabs

Underline indicator only. `border-b border-[--border]` container, `gap-8` between items.
- **Active:** `border-b-2 border-[--accent]`, accent text, `font-semibold`
- **Inactive:** muted text, `border-b-2 border-transparent`, hover to `--text`

### Avatars

Circular. Letter-initial fallback: centered initial, `--muted` text, `--surface-2` bg, `border-[--border]`.

| Context | Size |
|---|---|
| Comment | `w-8 h-8` (32px) |
| Post / User card | `w-10 h-10` (40px) |
| Profile header | `w-24 h-24` (96px) |

### Archives Card

`--surface` bg, `rounded-xl`, standard border. Restore action: info-tinted pill with `--info-soft` bg.

### Topic Pill

`text-[12px]`, `px-3 py-1.5`, `rounded-lg`, `--surface-2` bg, `--muted` text, border, hover to `--text`.

### Badges

`text-[11px] font-semibold px-2.5 py-1 rounded-md`, accent-soft bg, accent text, accent-border.

### Empty States

Centered, `py-20`. Icon: `text-3xl --accent opacity-50`. Message: `text-[15px] font-medium --muted`.

---

## Motion

- **Default transition:** `duration-200`, `ease-out`
- **Properties animated:** `color`, `background-color`, `border-color`, `opacity`, `transform`
- **No bounce, no elastic.** Ease-out only.
- **Theme switch:** 300ms transition on bg, color, border via `.theme-transitioning` class
- **`prefers-reduced-motion`:** all durations collapse to `0.001ms`.

---

## Iconography

Library: `react-icons` v5 (HeroIcons set). Icons are decorative support, always paired with a visible label or `aria-label`.

---

## Accessibility Patterns

- Focus ring: `focus-visible:ring-2 ring-[--ring]` (accent at 35-40% opacity)
- Ring offset: `outline-offset: 2px`
- `-webkit-tap-highlight-color: transparent` on interactive elements
- Color is never the only state signal
- Touch targets: minimum 44px on mobile
- Scrollbar: custom, 6px, warm-tinted, `border-radius: 999px`