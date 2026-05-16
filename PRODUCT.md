# Product

## Register

product

## Users

Broader tech audience: developers, engineers, founders, and anyone who tracks the AI/startup/tech space. Context of use is ambient: someone glancing between tasks to catch what's surfacing in the conversation, not deep reading sessions. They're time-pressed, skeptical of clickbait, and capable of evaluating signal from noise on their own once the noise is removed for them.

## Product Purpose

Signal is an AI-ranked tech news reader. It scrapes articles from sources across the tech web (Hacker News, The Verge, Wired, Engadget, etc.), scores each article's virality and cultural relevance using Claude, and surfaces the top stories ranked by impact rather than recency. Success looks like a reader who opens Signal instead of opening six browser tabs, because they trust it's already filtered the important from the forgettable.

## Brand Personality

Sharp, intelligent, direct. Like The Information or Stratechery: editorial confidence without noise, no hand-holding, no filler. The product trusts that users know what they want.

## Anti-references

- **TechCrunch / Mashable**: noisy layouts, clickbait headlines, ad-cluttered pages, breathless tone.
- **Flipboard / Apple News**: consumer-magazine carousel aesthetic, cover-photo-first, algorithmic personalization theater.

## Design Principles

1. **Signal over noise** — UI surface area shrinks behind the content. Every visual element that doesn't help the reader evaluate a story faster should be removed.
2. **Earned hierarchy** — Visual weight maps directly to virality score. The highest-scored story commands the most space and attention. Layout is not decoration; it communicates importance.
3. **Respect the reader's time** — No splash screens, no loading ceremonies, no pagination that interrupts flow. Filtering and sorting respond instantly.
4. **Dark by default, intentionally** — Tech readers often work across time zones, at night, across large monitors. Dark is a physical scene choice ("SRE at 2am on a 27-inch monitor") not a style gesture.
5. **The score explains itself** — Virality scores and AI reasoning should be readable at a glance without a tooltip or explainer. Design the score display as a first-class UI element, not a badge slapped on a card.

## Accessibility & Inclusion

WCAG AA. Sufficient contrast on all text/background pairs, full keyboard navigation, screen-reader-compatible markup. Respect `prefers-reduced-motion` for any animations. No critical information conveyed by color alone (score labels must accompany score colors).
