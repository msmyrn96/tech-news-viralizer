---
name: Viralizer
description: AI-ranked tech news reader. Surfaces high-virality stories from across the tech web, ordered by cultural impact.
colors:
  accent: "#fbbf24"
  surface-base: "#09090b"
  surface-raised: "#18181b"
  surface-border: "#27272a"
  surface-border-hover: "#3f3f46"
  text-dim: "#52525b"
  text-muted: "#71717a"
  text-secondary: "#a1a1aa"
  text-primary: "#fafafa"
  score-fire: "#f87171"
  score-hot: "#fb923c"
  score-bg-fire: "#450a0a"
  score-bg-hot: "#431407"
  score-bg-trending: "#451a03"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.1em"
rounded:
  pill: "9999px"
  card: "16px"
  badge: "6px"
  logo: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  card: "20px"
  section: "24px"
  page: "32px"
components:
  filter-pill-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-base}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
    typography: "{typography.label}"
  filter-pill-ghost:
    backgroundColor: "{colors.surface-border}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
    typography: "{typography.label}"
  article-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  badge-fire:
    backgroundColor: "#450a0a"
    textColor: "{colors.score-fire}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
    typography: "{typography.label}"
  badge-trending:
    backgroundColor: "{colors.score-bg-trending}"
    textColor: "{colors.accent}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
    typography: "{typography.label}"
  badge-hot:
    backgroundColor: "{colors.score-bg-hot}"
    textColor: "{colors.score-hot}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
    typography: "{typography.label}"
  badge-signal:
    backgroundColor: "{colors.surface-border}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.badge}"
    padding: "2px 8px"
    typography: "{typography.label}"
---

# Design System: Viralizer

## 1. Overview

**Creative North Star: "The Intelligence Terminal"**

Viralizer is a newsroom workstation, not a feed. The physical scene: a developer or founder glancing at a second monitor while compiling, wanting to know what is actually happening in tech without opening six tabs. The interface functions like a well-calibrated instrument: information present when you look, absent when you do not, never competing for the eye. Dark, precise, purposeful.

Color strategy is Restrained: near-void charcoal surfaces with a single alert-amber accent used on no more than 10% of any screen. The amber is not decorative; it signals what matters. Every appearance of amber, whether on a virality badge, a selected filter, or the live indicator dot, means the same thing: pay attention to this. Its rarity is the point.

Viralizer explicitly rejects the consumer-magazine carousel (Flipboard, Apple News) and the noisy ad-funded news feed (TechCrunch, Mashable). No hero images that load before headlines, no category color tabs, no author avatars competing with article titles. The score is the only hierarchy signal that counts. Everything else recedes.

**Key Characteristics:**

- Near-void background; content reads like ink on slate
- Alert amber as a single, semantic accent with one meaning: ranked above the noise
- Geist Sans for editorial weight; Geist Mono for data, counts, and metadata
- Flat surfaces throughout; depth via tonal layering, never shadows
- Components recede; articles lead

## 2. Colors: The Terminal Palette

One accent. Eight neutral steps. A self-contained status layer for scores. Nothing else.

### Primary

- **Alert Amber** (`#fbbf24`, oklch(84% 0.17 83)): The sole accent in the entire system. Legal uses: virality badge (Trending tier only), active filter pill, logo mark, live feed dot. Four uses and no more. If amber appears without one of these justifications, it is wrong.

### Neutral (tonal depth stack, darkest to lightest)

- **Near-Void** (`#09090b`, oklch(7% 0.004 285)): Page canvas. Not pure black; zinc-tinted so it reads as charcoal, not void, on calibrated monitors.
- **Graphite Surface** (`#18181b`, oklch(12% 0.004 285)): All card and container backgrounds. The entire elevation system lives in this single step above Near-Void.
- **Subtle Border** (`#27272a`, oklch(19% 0.005 285)): Default borders, horizontal dividers, scrollbar thumb, skeleton fill. If a separator is needed and nothing is active, this is the color.
- **Lifted Border** (`#3f3f46`, oklch(27% 0.005 285)): Hover-state borders, sort toggle container background. Communicates interactivity without introducing color; the only affordance available on flat surfaces.
- **Dim Text** (`#52525b`, oklch(37% 0.006 285)): Least-visible metadata. Nav article count, scrollbar hover, footer timestamps where receding is correct. Use when the information should be findable but not read at a glance.
- **Muted Text** (`#71717a`, oklch(49% 0.006 285)): Article summaries, source labels, tag chip text, SIGNAL-tier badge text. The workhorse secondary text step. Contrast ratio on Graphite Surface: 4.6:1 (WCAG AA).
- **Secondary Text** (`#a1a1aa`, oklch(66% 0.006 285)): Ghost filter pill text, inactive sort toggle labels, arrow icons at rest. One step brighter than Muted; use when the text is interactive but unpressed.
- **Primary Text** (`#fafafa`, oklch(98% 0.003 285)): Article headlines, card titles, brand mark, active filter pill text on amber. Never pure white (`#ffffff`); the faint zinc tint (`chroma 0.003`) keeps it from clashing with the background on uncalibrated displays.

### Status Layer (score colors only; never used outside score badges)

The status layer is a closed system. These four color pairs are reserved for virality badge tiers and nothing else. Introducing any status-layer color into a non-score context is prohibited.

| Tier     | Score  | Text                         | Background                  |
| -------- | ------ | ---------------------------- | --------------------------- |
| FIRE     | 80–100 | `#f87171` oklch(70% 0.19 22) | `#450a0a`                   |
| HOT      | 60–79  | `#fb923c` oklch(76% 0.18 55) | `#431407`                   |
| TRENDING | 40–59  | `#fbbf24` (= accent)         | `#451a03`                   |
| SIGNAL   | 0–39   | `#71717a` (= Muted Text)     | `#27272a` (= Subtle Border) |

Each tier has a matching border at 60% opacity: `rgba(185,28,28,0.6)` / `rgba(194,65,12,0.6)` / `rgba(180,83,9,0.6)` / `rgba(82,82,91,0.6)`.

### Named Rules

**The One Viralizer Rule.** Amber has four legal uses. A fifth is a mistake. No exceptions.

**The Closed Status Layer Rule.** Score colors (red-400, orange-400) are prohibited outside virality badge tiers. They are not available for general error states, warnings, or decorative purposes. For UI error states, use Primary Text weight contrast, not color.

**The No-Context-Free Color Rule.** Score tier colors never appear without their text label (FIRE / HOT / TRENDING / SIGNAL). Color blind users read the label; sighted users read both. Removing the label fails both groups.

**The No-Pure-Black Rule.** `#000000` is never used. Near-Void (`#09090b`) is the floor. This preserves depth headroom: pure black has nowhere to go.

## 3. Typography

**Display Font:** Geist (with system-ui, sans-serif fallback)
**Body Font:** Geist (same family, different weight and size)
**Label / Data Font:** Geist Mono (with monospace fallback)

**Character:** Geist is geometric without being cold. Its optical corrections at small sizes keep it legible at 13px body text without the sterility of pure geometric grotesques. Crucially, it has no personality to project: the typeface makes no aesthetic claim, so hierarchy comes entirely from weight and size contrast, not from the face itself. Geist Mono is the data substrate. It handles every number, timestamp, score, and count. The visual switch from sans to mono is the semantic switch from prose to data: readers unconsciously understand that mono text is a measurement or label, not a sentence.

### Type Scale

The scale runs from 10px to 36px using a 1.154 ratio between body (13px) and title (15px), then stepping to headline (20-24px) and display (30-36px). The wide jump between Title and Headline is intentional: it creates a visible rank gap between the featured story and the grid.

| Role     | Family     | Size                     | Weight | Line Height | Tracking | Where                                  |
| -------- | ---------- | ------------------------ | ------ | ----------- | -------- | -------------------------------------- |
| Display  | Geist      | clamp(30px, 4vw, 36px)   | 600    | 1.0         | -0.025em | Page headline, once per view           |
| Headline | Geist      | clamp(20px, 2.5vw, 24px) | 600    | 1.25        | -0.02em  | Featured article title only            |
| Title    | Geist      | 15px                     | 600    | 1.35        | -0.015em | Standard card titles                   |
| Body     | Geist      | 13px                     | 400    | 1.625       | 0        | Article summaries (clamped 2-3 lines)  |
| Label    | Geist Mono | 11px                     | 500    | —           | 0.1em    | Source name, filter pills, sort toggle |
| Data     | Geist Mono | 10-11px                  | 600    | —           | 0.1em    | Scores, timestamps, counts             |

Body max line length: 65ch. Apply `max-width: 65ch` to summary paragraphs; unclipped text at variable width breaks rhythm.

### Font Feature Settings

Geist Mono renders numbers with default lining figures. Apply `font-variant-numeric: tabular-nums` to any column of numbers so they align vertically. This is already correct in the nav article count and metadata row; preserve it in any new data-displaying context.

### Hierarchy

- **Display** (the page, once): Left-aligned, not centered. Composed as a two-line editorial statement. The second line intentionally dims to Secondary Text (`#a1a1aa`) to create within-display contrast without using two type sizes.
- **Headline** (the lead story, once): Horizontal featured card only. At `clamp(20px, 2.5vw, 24px)`, it reads at exactly one rank above Title without approaching Display's scale. If the featured card is removed, Headline is unused.
- **Title** (every standard card): Semi-tight tracking (-0.015em) at 15px / 600 weight. Three lines maximum; add `-webkit-line-clamp: 3` if titles exceed this.
- **Body** (summaries only): 13px / 400 weight. Muted Text color (`#71717a`). Never Primary Text; summaries are supporting detail, not the primary read.
- **Label** (categorical UI): Geist Mono, uppercase, letter-spacing 0.1em. Every use of Label signals to the reader "this is a category or control, not content." Never use Label weight/case for article content.
- **Data** (measurements): Geist Mono, 600 weight, `tabular-nums`. Score numbers, timestamps, article counts. Bold within mono to give numbers authority over their mono context.

### Named Rules

**The Mono Data Rule.** Every number, every timestamp, every count uses Geist Mono. Proportional digits in a data row break column alignment. If a new component displays numbers and they are not in Geist Mono, it is wrong.

**The Title Ceiling Rule.** Article titles never exceed Headline scale. Display belongs to the page. A featured article title rendered at Display scale is a tabloid cover, not a news reader.

**The Two-Line Display Rule.** The page Display headline is always two lines; the second line drops to Secondary Text color (`#a1a1aa`). This is not a style; it is structure. Single-line display headlines look incomplete. Three-line headlines encroach on article space.

## 4. Elevation

Viralizer is flat by intent. The depth hierarchy is tonal, not shadow-based: every surface sits one luminance step above the one beneath it (Near-Void `#09090b` → Graphite Surface `#18181b` → Subtle Border `#27272a`). Nothing floats; everything occupies the same plane.

Shadows are absent at rest. A barely-perceptible `box-shadow: 0 1px 2px rgba(0,0,0,0.3)` appears on the active sort-toggle pill to separate the selected state from its container, but this is a state indicator, not decorative lift. The nav bar uses `backdrop-filter: blur(12px)` at `#09090b` 85% opacity; functional (maintains readability during scroll), not ambient.

### Named Rules

**The Flat-By-Default Rule.** No surface casts a shadow at rest. Hover and active states are expressed through border-color changes (`#27272a` → `#3f3f46`) and translate transforms (`translateY(-2px)`). If a resting element has a shadow, remove it.

## 5. Components

### Filter Pills

Quiet selection controls. The amber active state is the only non-zinc color across the entire filter bar; inactive pills are pure zinc.

- **Shape:** Fully rounded (9999px)
- **Inactive:** `#27272a` background, `#a1a1aa` text, 6px 12px padding, 11px Geist Mono uppercase, letter-spacing 0.1em
- **Active:** `#fbbf24` background, `#09090b` text; identical dimensions to inactive — size never changes on state
- **Hover (inactive):** background lifts to `#3f3f46`, text lightens to `#e4e4e7`; no size or shape change
- **Active:hover:** no visual change; active is already the terminal state
- **Transition:** `all 150ms`; sub-200ms so it reads as instant, not animated
- **Press (:active):** `scale(0.97)` for 100ms; tactile confirmation without layout shift

### Sort Toggle

A segmented pill-within-pill. Not two separate buttons. The outer container carries the `#27272a`/80% background and a 1px `#3f3f46`/50% border; the inner selected segment is `#3f3f46` background with amber text and a single `box-shadow: 0 1px 2px rgba(0,0,0,0.3)` (the only shadow in the system, carried because it is a state indicator). Unselected labels are Secondary Text (`#a1a1aa`); on hover they lift to Dim Text (`#e4e4e7`). Both segments share the same Geist Mono 11px uppercase label style as filter pills.

### Article Card (Standard)

The primary surface. Cards recede; their job is to deliver title, score, and source, then disappear.

- **Corner Style:** Gently rounded (16px radius)
- **Background:** Graphite Surface (`#18181b`); never more than one step above Near-Void
- **Border:** 1px Subtle Border (`#27272a`) at rest; lifts to Lifted Border (`#3f3f46`) on hover
- **Background hover:** `rgba(24,24,27,0.80)` — barely perceptible, signals hover without distraction
- **Hover lift:** `translateY(-2px)` via Framer Motion spring (stiffness 400, damping 30); gated on `prefers-reduced-motion: no-preference`
- **Internal padding:** 20px (1.25rem) on all sides
- **Image area:** `aspect-video` (16:9), `object-cover`. On hover: scale `1.03x` over 500ms `ease-out`. Bottom gradient: `linear-gradient(to top, rgba(24,24,27,0.5), transparent)` prevents a hard image-to-body seam
- **Card anatomy (top to bottom):** image → `[source label] [virality badge]` → title (Title scale) → summary (Body scale, 2-line clamp) → `[tags] [read time · timestamp · arrow↗]`
- **Arrow icon:** opacity 0 at rest, opacity 1 on card hover, amber color. The only arrow in the system; its appearance confirms the card is a link

### Article Card (Featured)

The first article in the feed receives featured treatment: larger, horizontal, more breathing room.

- **Layout:** `flex-row` on `md:` and above; `flex-col` on mobile (image on top, content below)
- **Image:** `width: 42%`, `min-height: 240px`, `object-cover`; same scale hover and gradient fade as standard
- **Content padding:** 28px (`py-7 px-7`)
- **Title scale:** Headline (clamp 20-24px) instead of Title (15px)
- **Summary clamp:** 3 lines instead of 2
- **Tag display:** up to 4 tags; standard cards show max 3

### Virality Badge

Score display is a first-class UI element. Four semantic tiers, each with a matching color pair (text + tinted background) and a required text label. Color alone never carries the rank.

- **Shape:** 6px radius (rounded-md)
- **Layout:** `inline-flex gap-1.5`, score value in `font-bold`, mid-dot separator `·` at 50% opacity, uppercase label in 500 weight
- **Font:** Geist Mono, 10px, `letter-spacing: 0.1em`, uppercase

| Tier     | Score  | Text      | Background | Border                |
| -------- | ------ | --------- | ---------- | --------------------- |
| FIRE     | 80–100 | `#f87171` | `#450a0a`  | `rgba(185,28,28,0.6)` |
| HOT      | 60–79  | `#fb923c` | `#431407`  | `rgba(194,65,12,0.6)` |
| TRENDING | 40–59  | `#fbbf24` | `#451a03`  | `rgba(180,83,9,0.6)`  |
| SIGNAL   | 0–39   | `#71717a` | `#27272a`  | `rgba(82,82,91,0.6)`  |

The SIGNAL tier is the default state for articles not yet scored. It reads quietly and never draws attention.

### Navigation Bar

Sticky, minimal. Exists to orient, not to decorate.

- **Background:** Near-Void (`#09090b`) at 85% opacity with `backdrop-filter: blur(12px)` — functional blur, not decorative
- **Height:** 52px (`h-13`)
- **Border-bottom:** 1px Subtle Border (`#27272a`) at 80% opacity
- **Left cluster:** logo mark (28×28px amber square, 8px radius) + "SIGNAL" in 14px Geist 600 uppercase + article count in 11px Geist Mono Dim Text (`#52525b`)
- **Right cluster:** "AI-ranked tech feed" in 11px Geist Mono Dim Text (hidden below `sm:640px`) + live indicator
- **Live indicator:** 8px amber dot with outer `animate-ping` ring at 60% opacity, `1s cubic-bezier(0,0,0.2,1) infinite`. Communicates that the feed updates without requiring a refresh control

### Tag Chips

Descriptive labels attached to articles. Read-only at current scope; no interactivity.

- **Background:** Subtle Border (`#27272a`)
- **Text:** Muted Text (`#71717a`), 10px Geist Mono
- **Shape:** 4px radius (one step softer than badge's 6px; chips are lower rank)
- **Padding:** 2px 8px
- **Quantity:** max 3 on standard cards, max 4 on featured. Truncate silently; never show "+N more"
- **Future:** if tags become filterable, apply filter pill styling on tap. The visual grammar is established; the interaction layer is not yet implemented

### Empty State

Displayed when a filter combination returns no articles, or before the first scrape run completes.

- **Container:** centered, `padding-block: 112px` (py-28), no card border or background
- **Icon container:** 56px × 56px square, 16px radius, Graphite Surface (`#18181b`) background, 1px Subtle Border (`#27272a`)
- **Icon:** MagnifyingGlass, 22px, Muted Text (`#71717a`)
- **Headline:** "No articles yet", 14px Geist 500, Secondary Text (`#a1a1aa`)
- **Sub-copy:** one sentence, 12px Geist, Muted Text (`#71717a`), max-width ~280px, leading-relaxed
- **No CTA button.** The state is temporary and self-resolving. A button would imply action the user cannot take.

### Loading Skeleton

Matches the exact card layout it replaces. Spinners are prohibited.

- **Fill:** Subtle Border (`#27272a`) rectangles; no rounded shimmer lines
- **Animation:** `animate-pulse` — opacity oscillation 50% → 100% → 50% at 2s duration
- **Featured skeleton:** horizontal flex, `w-full md:w-[42%]` image block + content column with four text bars at widths 25%, 80%, 100%, 75%
- **Grid skeletons:** 6 cards, aspect-video image block + text bars; same widths as featured but stacked vertically
- **Never mix skeletons and live cards** in the same grid. Either all cells are loading or none are.

## 6. Do's and Don'ts

### Do:

- **Do** restrict amber (`#fbbf24`) to the four semantic uses: score badge (Trending tier), active filter pill, logo mark, live dot. A fifth use dilutes the signal. If you need a new use, justify it against the One Viralizer Rule.
- **Do** use Geist Mono for every number, timestamp, article count, and score. Proportional digits in data contexts break alignment.
- **Do** express depth through tonal color shifts (Near-Void → Graphite Surface → Subtle Border). Shadows on resting elements are forbidden.
- **Do** line-clamp article summaries (2 lines standard, 3 lines featured). Variable-length body text breaks grid rhythm.
- **Do** include the score text label alongside every score color. Red alone means nothing without "FIRE."
- **Do** gate all translate and scale animations behind `prefers-reduced-motion: no-preference`. The UI must be fully functional and readable without motion.
- **Do** verify WCAG AA contrast on every new text/background pairing before shipping. The weakest pair in the system, Muted Text on Graphite Surface (`#71717a` on `#18181b`), passes at 4.6:1.

### Don't:

- **Don't** use a carousel, cover-photo-first layout, or horizontal scrolling story grid. These are the Flipboard and Apple News patterns: consumer-magazine, aesthetically loud, treating images as lead content. Viralizer treats headlines as lead content.
- **Don't** add category color tabs, author photos, engagement counts (likes, shares), or any decoration that competes with the article title for attention. These are TechCrunch and Mashable patterns.
- **Don't** use gradient text. Score labels are solid-color text on a tinted background. Page headlines are `#fafafa` on `#09090b`. No gradient, no `background-clip: text`.
- **Don't** add a second accent color. The system has one: alert amber. Adding purple, teal, green, or any color fragments the single signal amber is supposed to carry.
- **Don't** add `box-shadow` to a resting card. Cards separate from the background through tonal contrast alone. A shadow makes the UI feel heavy and increases GPU cost during scroll.
- **Don't** use a `border-left` thicker than 1px as a colored accent stripe on cards, list items, or callouts. If an element needs emphasis, use a tinted background or a full border instead.
- **Don't** center the page headline. The editorial headline is left-aligned. Centered headings read as landing pages; left-aligned headings read as publications.
- **Don't** use Inter or a generic system-ui fallback as the primary display or headline font. Geist is the brand typeface. system-ui is acceptable only in metadata Geist Mono fallback contexts.
