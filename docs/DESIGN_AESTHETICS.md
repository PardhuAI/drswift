# Dr.Swift Website — Design Aesthetics

> **Purpose:** The single source of truth for visual and UX decisions on the Dr.Swift marketing site (`New_Dr_Swift_Website`).  
> **Philosophy:** Trustworthy healthcare that feels warm and human — not a cold lab portal, not a generic e-commerce clone.

---

## 1. Design Philosophy

Dr.Swift sits at the intersection of **clinical credibility** and **everyday family health**. The site should feel:

- **Reassuring** — calm tones, generous whitespace, clear hierarchy
- **Insightful** — “See more than numbers” is the brand promise; UI previews and report comparisons belong front and center
- **Approachable** — lifestyle photography, plain language, multi-channel booking (web, app, WhatsApp)
- **Alive, not loud** — purposeful motion (hero spring, staggered reveals) that respects `prefers-reduced-motion`

We borrow the *ideology* of premium health-commerce (serif headlines, pill CTAs, alternating sections, trust bands) but **never copy another brand’s layout wholesale**. The current homepage hero, category scroll, audience columns, and feature blocks are signature Dr.Swift — protect them.

---

## 2. What Makes Dr.Swift Different

| Dr.Swift owns | Generic lab sites skip |
|---------------|------------------------|
| Animated hero headline with health-color accents | Static stock headline |
| Bullet reveals for at-home + app + family account | Single “Book now” line |
| Horizontal category scroll with swipe hint | Plain link lists |
| For Him / Her / Loved Ones audience grid | One-size-fits-all catalog |
| Health insights + past-vs-current report previews | PDF download only |
| Trend graphs (HbA1c, etc.) | Raw numbers table |
| Multi-channel CTAs (app, WhatsApp, web) | Cart-only checkout |

When adding new sections, ask: *Does this reinforce insights, family health, or trusted at-home collection?*

---

## 3. Color Palette

### Primary & UI

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-blue` | `#1E5BD7` | Primary buttons, links, category card gradients, brand mark |
| `--color-blue-dark` | `#123F9B` | Button hover, emphasis text |
| `--color-blue-soft` | `#EDF4FF` | Nav hover, audience section wash, subtle highlights |
| `--color-navy` | `#1E2C8F` | Trust bands, footer, future full-width CTAs |
| `--color-navy-dark` | `#161F6E` | Navy section hover / pressed states |

### Health & Organic Accents

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-teal` | `#1AA0B0` | Feature accents, graph highlights |
| `--color-mint` | `#7ECDC0` | Decorative leaf patterns, step circles (future) |
| `--color-green` | `#4E8C73` | “Health” copy accents, For Her column |
| `--color-green-bright` | `#2F9850` | Health gradient endpoint, positive metrics |

### Hero Signature (do not flatten to one blue)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-hero-purple` | `#5A2D8F` | Hero line one — “See More Than Numbers” |
| `--color-hero-red` | `#D61F26` | Animated “See” |
| `--color-hero-yellow` | `#F5A300` | Animated “Your” |
| Health gradient | `#1E5BD7 → #1AA0B0 → #2F9850` | Animated “Health.” word |

### Neutrals

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-ink` | `#162033` | Headings, primary body on light bg |
| `--color-muted` | `#657084` | Body paragraphs, descriptions |
| `--color-text-secondary` | `#666666` | Secondary descriptions (long form) |
| `--color-caption` | `#999999` | Dates, fine print, tertiary labels |
| `--color-line` | `#DCE3EE` | Borders, dividers, card outlines |
| `--color-panel` | `#FFFFFF` | Cards, hero frame, header |
| `--color-soft` | `#F6F8FB` | Alternating section background |
| `--color-soft-alt` | `#F5F5F5` | Secondary alternating sections |

### Semantic (use sparingly)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-promo` | `#D4E157` | Promo badges only — never large backgrounds |
| `--color-star` | `#FFB800` | Ratings when real review data exists |

---

## 4. Typography

**Rule:** Serif for editorial headlines · Sans for everything else.

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Logo / brand name | Inter | 26px (`1.625rem`) | 700 | `--color-blue` |
| Hero headline | Source Serif 4 | `clamp(1.4rem–3.3rem)` | 700 | Hero signature colors |
| Section H2 | Source Serif 4 | `clamp(1.7rem–2.4rem)` | 600 | `--color-ink` |
| Sub-headings H3 | Inter | `1.35–1.65rem` | 700 | `--color-ink` or accent |
| Card / tile titles | Inter | `1–1.125rem` | 600 | Contextual |
| Body | Inter | `16px` (`1rem`) | 400 | `--color-muted` |
| Hero bullets | Inter | `~1.02rem` | 400 | `--color-ink` |
| Buttons | Inter | `14–18px` | 700 | White or `--color-blue` |
| Price | Inter | `22–24px` | 700 | `--color-ink` |
| Eyebrow / overline | Inter | `12px` | 800 | `--color-green` on inner pages; `--color-blue` on marketing overlines · uppercase · `0.08em` tracking |
| Caption | Inter | `12–14px` | 400 | `--color-caption` |

**Line height:** Body `1.55` · Headlines `1.04–1.08`  
**Letter spacing:** Headlines `-0.03em` · Eyebrows `+0.08em`

---

## 5. Layout & Spacing

| Token | Value | Usage |
|-------|-------|--------|
| `--container` | `1180px` | Max content width |
| `--space-section-y` | `64px` | Default section vertical padding |
| `--space-section-y-sm` | `24px` | Compact sections (quick links) |
| `--space-heading-bottom` | `22–44px` | Gap below section titles |
| `--space-grid` | `16–32px` | Card grids, carousel gaps |
| `--space-card` | `18–28px` | Internal card padding |
| `--scroll-header-offset` | `84px` | Anchor scroll under sticky header |

### Section rhythm

Alternate backgrounds to create pace without redesigning content:

- **White** — hero frame, features, default
- **Soft** (`--color-soft`) — category scroll, test carousel, inner page bodies
- **Blue wash** — audience tests (existing gradient — keep)
- **Navy** (`--color-navy`) — footer, future testimonial / community bands

Use utility classes: `.section-bg-white`, `.section-bg-soft`, `.section-bg-navy`

---

## 6. Navigation

Dr.Swift uses a **light sticky header** — intentional, airy, distinct from dark-bar competitors.

| Property | Value |
|----------|--------|
| Background | `rgba(255,255,255,0.94)` + `backdrop-filter: blur(14px)` |
| Border | `1px solid var(--color-line)` |
| Height | `72px` min |
| Logo | Leaf SVG + “Dr.Swift Diagnostics” in Inter bold blue |
| Nav links | Inter, blue, soft blue pill on hover/active |
| Mobile | Hamburger → dropdown panel with links + account shortcuts |

**Nav items (current):** tests · reports · about · login/signup · doctors · customer

**Do not** switch to a dark nav unless the whole brand system is revisited together.

---

## 7. Hero (Signature — Preserve Structure)

The hero is the emotional center of the site. **Keep:**

- Two-column card: copy left, lifestyle photo right
- Spring animation on “See / Your / Health”
- Staggered bullet reveal with diamond icons
- Image CTAs overlaid on photo (`see all tests`, `see all promotions`)
- Soft white gradient blend into photo

**Visual rules:**

- Hero frame: white panel, light border, soft shadow — not full-bleed carousel
- Background shell: `linear-gradient(#fafcff, #ffffff)`
- Photo: warm, relatable (couple/family at home) — never sterile clinic stock
- CTAs: pill buttons, primary blue + secondary white

---

## 8. Component Patterns

### Category scroll (`.quick-card`)

- Horizontal scroll on all breakpoints; swipe hint on mobile
- Gradient blue cards, white text, `200×140px`, `8px` radius
- Staggered `panIn` entrance animation
- Hover: darken gradient

### Audience columns (`.audience-tests`)

- Three columns: For Him (blue), For Her (green), Loved Ones (purple)
- `2×2` tile grid per column + “See more tests” gradient button
- Section heading: optional gentle wobble animation when in view
- Background: blue-soft gradient with top/bottom border

### Feature pairs (`.feature-pair`)

- Image/graph + copy side by side on desktop; stacked card on mobile
- Cards lift on hover (`translateY(-10px)`, deeper shadow)
- Accent heading colors: `.accent-blue`, `.accent-teal`, `.accent-green`

### Test cards (`.test-card`)

- White card, `18px` radius, image top ~160px
- Price bold + strikethrough old price
- Full-width primary pill button
- **Dr.Swift CTA language:** prefer “Book test” / “View details” over “Add to cart” unless cart flow exists

### Quick links (`.quick-link-list`)

- Compact horizontal chips between major sections
- Hover: invert to solid blue

### Inner pages (tests, reports, about)

- Eyebrow label → H1 serif → body copy
- Placeholder panels use same tokens and card surfaces

---

## 9. Button System

All CTAs are **pill-shaped** (`border-radius: 999px`).

| Type | Background | Text | Border | Hover |
|------|------------|------|--------|-------|
| Primary | `--color-blue` | White | None | `--color-blue-dark` |
| Secondary | White | `--color-blue` | `--color-line` | Blue fill (contextual) |
| Image overlay | `--color-blue` | White | None | `--color-blue-dark` |
| Navy outline (future) | Transparent | White | `1px white` | `rgba(255,255,255,0.12)` fill |

Min height: `44px` (standard) · `52px` (report CTA section)  
Padding: `10px 18px` (standard) · `14px 30px` (emphasis)

---

## 10. Motion & Animation

| Animation | Where | Duration | Notes |
|-----------|-------|----------|-------|
| `hero-spring-pop` | Hero color words | ~1.15s staggered | Cubic-bezier bounce |
| `hero-point-reveal` | Hero bullets | 0.7s staggered | Starts after headline |
| `panIn` | Quick cards | 520ms + 70ms × index | On load |
| `audience-heading-wobble` | Audience H2 | 3.6s loop | Subtle, playful |
| Card hover lift | Features, photos | 260ms | `-4px` → `-10px` |

**Always** provide `@media (prefers-reduced-motion: reduce)` fallbacks — instant visible state, no infinite loops.

---

## 11. Imagery

- **Hero:** Lifestyle, home setting, diverse families/couples
- **Features:** Real app UI screenshots (health insights) preferred over generic icons
- **Test cards:** Soft photographic thumbs or branded gradients — not microscope clichés
- **Graphs:** Clean SVG (HbA1c trend) — artistic but readable
- **Format:** WebP with JPG fallback; lazy-load below fold

---

## 12. Shadows & Elevation

| Token | Value | Usage |
|-------|-------|--------|
| `--shadow-card` | `0 10px 26px rgba(33,49,78,0.08)` | Test cards, nav dropdown |
| `--shadow-soft` | `0 14px 34px rgba(33,49,78,0.10)` | General panels |
| `--shadow-pop` | `0 16px 36px …` | Feature cards at rest |
| `--shadow-pop-hover` | `0 26px 52px …` | Feature cards on hover |
| Header on scroll | `0 2px 8px rgba(0,0,0,0.08)` | Optional enhancement |

Flat buttons — no button shadows unless hover lift is used.

---

## 13. Border Radius Scale

| Element | Radius |
|---------|--------|
| Buttons, pills | `999px` |
| Hero / feature cards | `18px` (`--radius`) |
| Test cards | `18px` |
| Quick category cards | `8px` |
| Audience tiles | `10px` |
| Nav dropdown | `14px` |
| Inputs (future) | `8px` |

---

## 14. Homepage sections (complete)

| Section | Class / location | Background |
|---------|------------------|------------|
| Hero | `.hero-shell` | White gradient |
| Categories | `.quick-select` | Soft gray |
| Audience grid | `.audience-tests` | Blue wash |
| How it works | `.how-it-works` | White |
| Features / insights | `.features` | White |
| Report CTA | `.report-cta` | White |
| Featured tests | `.ordered-tests` | Soft gray |
| Family wellness | `.wellness-program` | White |
| Four reasons | `.reasons` | Soft gray |
| Testimonial | `.testimonial-band` | Navy |
| FAQ | `.faq` | White |
| Newsletter | `.newsletter` | Soft gray |
| Community CTA | `.community-band` | Navy |
| Footer | `.site-footer` | Navy |

---

## 15. Do's & Don'ts

### Do

- Use serif H1/H2 + sans everything else
- Keep hero animation and family-health messaging
- Alternate white / soft gray sections
- Show product UI (insights, reports, graphs)
- Write CTAs for Dr.Swift flows (book, app, WhatsApp)
- Respect reduced motion

### Don't

- Clone Labcorp layout or copy verbatim
- Flatten hero to single-color headline
- Add fake star ratings or review counts
- Use “Add to cart” without a cart backend
- Switch to dark nav without a coordinated brand pass
- Sacrifice mobile swipe patterns for desktop grids

---

## 16. Mobile Guidelines

| Breakpoint | Behavior |
|------------|----------|
| `< 880px` | Single-column hero; photo below copy; swipe hint on categories |
| `≥ 880px` | Two-column hero; hide swipe hint |
| `≥ 1024px` | 3-column audience grid; wider test cards |
| Touch targets | Minimum `44×44px` for buttons and nav |
| Horizontal scroll | `scroll-snap-type: x mandatory`; hide scrollbar |

---

## 17. CSS Token Reference

All tokens live in `assets/css/styles.css` under `:root`. Key names:

```css
/* Colors */
--color-blue, --color-blue-dark, --color-blue-soft
--color-navy, --color-navy-dark
--color-teal, --color-mint, --color-green, --color-green-bright
--color-hero-purple, --color-hero-red, --color-hero-yellow
--color-ink, --color-muted, --color-text-secondary, --color-caption
--color-line, --color-panel, --color-soft

/* Typography */
--font-body      /* Inter — UI, body, h3 */
--font-display   /* Source Serif 4 — h1, h2, hero */

/* Layout */
--container, --space-section-y, --radius, --radius-sm
--shadow-card, --shadow-soft, --shadow-pop, --shadow-pop-hover
```

When building new pages or components, **use tokens first** — never hard-code hex values in HTML or one-off CSS.

---

## 18. Page Checklist (new sections)

Before shipping any new block:

- [ ] Uses design tokens, not raw hex
- [ ] H2 is serif; body is muted sans
- [ ] Section has appropriate background tier (white / soft / navy)
- [ ] CTAs are pill buttons with correct primary/secondary variant
- [ ] Motion has reduced-motion fallback
- [ ] Mobile layout tested at 375px and 880px
- [ ] Copy reflects Dr.Swift (insights, family, at-home) — not generic lab text
