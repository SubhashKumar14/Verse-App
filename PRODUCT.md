# Product

## Register

product

## Users

Developers, students, builders, and thoughtful internet users who want a calmer, text-first social space. They share ideas, technical observations, progress updates, reflections, and short-form writing. They are not influencers; they are not chasing virality. They open VerseLy primarily to write — to publish a thought before the day gets loud — and secondarily to scan: reading thoughtful notes from people they follow at a deliberate pace.

Context: desktop or mobile, during a break, early morning, or end of day. Mindset: intentional. Attention: focused but unhurried.

## Product Purpose

VerseLy is a text-first social platform for intentional, short-form writing. It exists to give writing-oriented people a space where clarity and quality of thought are the primary value — not engagement metrics, trending content, or dopamine loops.

Success looks like: a user opens the app, writes and publishes a clear thought in under two minutes, reads three posts from people they follow, and closes the app feeling calm, not depleted.

## Brand Personality

Quiet. Sharp. Human.

Calm and precise, emotionally restrained — but warm enough to feel alive. The product should feel like it was made by people who care about craft and writing, not by a growth team optimizing for time-on-site.

Voice: confident but unhurried. Tone: professional without coldness. Emotional register: focused, earned, grounded.

## Anti-references

- Generic AI dashboard aesthetics (purple gradients, glowing cards, hero metric panels)
- Default Tailwind template styling (flat utility classes, identical card grids)
- Twitter/X's noise: trending sections, engagement bait, infinite algorithmic scroll
- Cyberpunk or neon dark modes
- Influencer-platform energy: large thumbnails, follower counts as status, viral mechanics
- Overdesigned hero animations and scroll-driven spectacle
- Any surface that makes writing feel secondary to browsing or reacting

## Design Principles

1. **Writing first.** The composer is never buried. The act of writing should feel natural and immediate — not like a function accessed deep inside a product.
2. **Calm is a feature.** Visual noise is a design failure here. Every added element must earn its place; the default answer is to remove, not add.
3. **Typography carries the product.** Type scale, weight contrast, and line rhythm are the primary design tools. Decoration fills what type lacks, not the reverse.
4. **Restraint at the surface, care in the detail.** From a distance: spare and quiet. Up close: considered and precise. The craft shows in spacing, weight, and state transitions — not ornament.
5. **The interface recedes; words remain.** Chrome disappears. The reader's attention belongs to content. UI should never compete with writing.

## Accessibility & Inclusion

No formal WCAG target, but the following requirements are binding:
- Readable contrast in both light and dark themes
- Keyboard-only navigation for all core flows (composer, feed, profile, settings)
- Visible, styled focus states — not browser defaults
- Screen reader-friendly labels for all buttons, icon-only controls, and composer actions
- Color is never the only signal for state; use shape, label, or icon alongside
- Motion is subtle and disabled — or reduced in duration — when `prefers-reduced-motion` is active
- Comfortable touch targets on mobile (minimum 44px)