---
name: UGI
description: Internal HR and compliance management system for Thai organisations
colors:
  primary: "oklch(0.44 0.27 292)"
  primary-deep: "oklch(0.33 0.23 292)"
  primary-ghost: "oklch(0.94 0.055 292)"
  accent: "oklch(0.72 0.14 75)"
  accent-pale: "oklch(0.95 0.04 75)"
  bg: "oklch(1.000 0.000 0)"
  surface: "oklch(0.971 0.009 292)"
  ink: "oklch(0.17 0.012 292)"
  muted: "oklch(0.44 0.010 292)"
  border: "oklch(0.87 0.009 292)"
  border-strong: "oklch(0.63 0.016 292)"
  error: "oklch(0.50 0.17 25)"
  error-pale: "oklch(0.95 0.040 25)"
typography:
  heading:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.02em"
  data:
    fontFamily: "Sarabun, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  control: "6px"
  card: "8px"
  panel: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.primary-ghost}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: UGI

## 1. Overview

**Creative North Star: "The Clear Instrument"**

UGI is built like a precision instrument: every reading accurate, every affordance obvious, nothing superfluous. The interface is calm under load. When an HR administrator opens a training log or a safety certificate, the system delivers the data and steps aside. There is no ornamentation that doesn't carry information, no decoration that earns a second glance. The surface disappears; the task remains.

The palette is anchored by a single deep studio violet — authoritative without aggression, present without distraction. On a pure white ground, it reads as a considered choice, not a corporate default. A warm amber signal colour provides contrast for status and alert contexts, where meaning must land instantly. Together they define a sparse, deliberate chromatic vocabulary: two brand roles, one neutral system, nothing invented.

This system explicitly rejects what PRODUCT.md names as anti-references: the generic Tailwind starter (zinc-on-white, no identity), classic enterprise HR platforms (Workday's heavy chrome and corporate blue, BambooHR's dated SaaS scaffolding), and anything that reads as "scaffolding" rather than "product." UGI should feel like a well-made internal tool that someone thought hard about — not a tutorial project with data in it.

**Key Characteristics:**
- Flat surfaces at rest; shadow responds to interaction, not decoration
- Single brand violet carries primary actions and active states; neutrals carry everything else
- Sarabun (Google Fonts) handles Thai script natively with correct glyph support; no font mixing in UI labels
- Density is earned: compact label sizes and tight scale ratios, but never cramped
- State vocabulary is complete: every interactive component expresses all six states

## 2. Colors: The Instrument Palette

A restrained palette: one primary, one accent, and a tinted-neutral system. The primary is the only saturated color used freely; the accent appears only for semantic signal.

### Primary
- **Studio Violet** (`oklch(0.44 0.27 292)`): The brand anchor. Used for primary buttons, active navigation states, links, focus rings, and checked inputs. White text only on filled surfaces at this lightness.
- **Studio Violet Deep** (`oklch(0.33 0.23 292)`): Hover and pressed state for primary fills. Never used as a standalone colour; only as the response to pointer interaction.
- **Studio Violet Ghost** (`oklch(0.94 0.055 292)`): The ghost button hover background and icon well resting state. Light enough to read as transparent at a glance; coloured enough to register intent.

### Secondary
- **Warm Signal Amber** (`oklch(0.72 0.14 75)`): The semantic signal colour. Reserved for warning badges, non-critical alerts, status pills, and amber-state indicators. Never used for primary actions. Dark ink text on filled amber badges.
- **Warm Signal Amber Pale** (`oklch(0.95 0.04 75)`): Badge and chip background for amber states. Pairs with amber text or ink text.

### Neutral
- **Pure White** (`oklch(1.000 0.000 0)`): Page background. Not warm, not tinted. The violet carries the brand; the ground is neutral.
- **Instrument Surface** (`oklch(0.971 0.009 292)`): Card and panel background. Barely-tinted off-white — not visible as a hue, but perceptibly distinct from the page ground under direct comparison. Used for table rows, card fills, sidebar panels.
- **Near-Black Ink** (`oklch(0.17 0.012 292)`): Body text. Carries the faintest violet lean, binding it to the brand without visible colorisation. Contrast vs white: ~16:1 ✓.
- **Composed Muted** (`oklch(0.44 0.010 292)`): Secondary text, placeholder text, disabled labels. Contrast vs white: ~5.4:1 ✓ (passes WCAG AA for normal text).
- **Border** (`oklch(0.87 0.009 292)`): Default control and card borders. Light enough to read as quiet; dark enough to define edges cleanly on white.
- **Border Strong** (`oklch(0.63 0.016 292)`): Focus-ring and hover-border state. Visibly darker than the default border; no glow, no colour bleed.
- **Error Red** (`oklch(0.50 0.17 25)`): Error states, destructive action confirmations. White text on filled error backgrounds.
- **Error Pale** (`oklch(0.95 0.040 25)`): Inline error background for input fields and callouts.

### Named Rules

**The One Voice Rule.** The primary violet is the only freely-used saturated colour. Accent amber appears only where meaning is semantic (warning, status, alert). There is no third brand colour; there are no decorative colour fills.

**The Muted-Not-Washed Rule.** Secondary text uses `muted` — a mid-tone that still passes 4.5:1 against white. Placeholder text does too. There are no "light grey for elegance" values lighter than `muted`.

## 3. Typography

**Display / UI Font:** Sarabun (Google Fonts, via `next/font/google`)
**Subsets:** `thai` + `latin` — native Thai glyph support, no fallback needed

**Character:** A single humanist sans handles all roles. Sarabun was designed specifically for Thai readability at screen sizes; its Latin glyphs are clean and professional. No display/body split — the weight and size scale creates hierarchy without family contrast.

### Hierarchy
- **Heading** (600, 24px, line-height 1.2, tracking -0.01em): Page-level titles. Used once per view. `text-wrap: balance` applied.
- **Title** (600, 15px, line-height 1.4): Card headings, section labels, dialog titles. The workhorse heading level.
- **Body** (400, 14px, line-height 1.5): All prose, list content, table rows. 65ch max-width on reading content; tables may run wider.
- **Label** (500, 12px, line-height 1, tracking 0.02em): Form labels, table column headers, badge text, nav items. Uppercase only for table headers, never for form labels or nav — the distinction matters in Thai.
- **Data** (400, 13px, line-height 1.5): ID fields, date strings, reference numbers.

### Named Rules

**The Thai-First Rule.** Thai script is the primary writing system in this interface. Font sizes below 13px are prohibited for body content containing Thai. Never apply negative letter-spacing to Thai text — it breaks glyph joining. The `label` role's tracking (0.02em) applies only when the string is Latin (column headers rendered in Thai use 0 tracking).

**The One Size Per Role Rule.** Each typography role has exactly one size. No fluid `clamp()` in product UI; screens are desktop-DPI and a shrinking `h1` in a panel looks worse, not better.

## 4. Elevation

Surfaces are flat at rest. Depth is conveyed by the tint difference between `bg` (white) and `surface` (barely-tinted), by borders, and by the explicit shadow response when an element demands attention.

**The Flat-By-Default Rule.** Cards do not cast shadows at rest. Shadows are a state response, not a design decoration. If a shadow is visible when nothing is happening, it is wrong.

### Shadow Vocabulary
- **Hover lift** (`0 2px 8px oklch(0.17 0.012 292 / 0.10)`): Cards and rows on pointer hover. Communicates interactivity. Removed immediately on mouse-out.
- **Modal** (`0 8px 40px oklch(0.17 0.012 292 / 0.18)`): Dialogs and sheet panels. Separates modal surface from the page.
- **Popover/Dropdown** (`0 4px 16px oklch(0.17 0.012 292 / 0.12)`): Floating menus, date pickers, comboboxes. Lighter than modal; same hue-cast.

Shadows use the ink colour's hue (`292`) as the cast colour, so they read as violet-tinted rather than generic grey.

## 5. Components

### Buttons
Precise, moderate radius. The primary button is the only element that uses a filled brand-colour surface.

- **Shape:** Gently curved (6px radius). Not pill-shaped, not square. One consistent value across all variants.
- **Primary:** Studio Violet fill (`oklch(0.44 0.20 292)`), white text, `8px 16px` padding, 14px 500-weight label. Hover → Violet Deep fill. Active → same as hover + slight scale-down (transform: scale(0.98)).
- **Ghost:** Transparent fill, 1px border (`border-strong`), primary violet text. Hover → Ghost Violet bg fill. Used for secondary actions that share the screen with a primary.
- **Destructive:** Error fill, white text. Same shape. Only for delete/remove confirmations after a modal prompt.
- **Focus:** 2px offset focus ring in `border-strong`. Visible without glow; keyboard-navigable.
- **Disabled:** 40% opacity. No interaction. Cursor: not-allowed.

### Inputs / Fields
- **Style:** White background, 1px `border` border, 6px radius, `8px 12px` padding, 14px body text.
- **Focus:** Border shifts to `primary` (1.5px). No inset shadow, no glow. Clear enough without spectacle.
- **Error:** Border shifts to `error`. Error pale background. Error text below field in 12px red, no icon prefix.
- **Disabled:** Surface background, muted text, no border interaction.
- **Placeholder:** `muted` colour (≥4.5:1 contrast). No lighter-than-muted placeholder styles.

### Cards / Containers
- **Corner Style:** Gently rounded panels (12px radius). Menu tiles, content cards.
- **Background:** `surface` (`oklch(0.971 0.009 292)`) — tinted off-white, distinct from the page ground.
- **Shadow Strategy:** Flat at rest (see Elevation). Hover lift shadow on interactive cards.
- **Border:** 1px `border` by default. On hover, border shifts to `border-strong`.
- **Internal Padding:** 20px — consistent across cards.
- **Do not nest cards.** A card inside a card is always wrong.

### Navigation
- **Navbar:** Sticky top, `h-14` (56px), glass treatment (background/90 + `backdrop-blur`). Border-bottom in `border`. Max-width 5xl container, aligned with content.
- **Logo:** 15px, 700-weight, `text-primary` (violet). No decoration.
- **User section:** Avatar (28px, full-radius, subtle violet ring), display name in 14px muted, sign-out button in ghost style (scaled: 12px, `6px 12px` padding).
- **Active state in future nav links:** `primary` text + primary-ghost background pill. No underline, no left-border stripe.

### Module Navigation List (Main Menu)
The main menu renders seven modules as an interactive navigation list.

- **Layout:** `<ul>` with `divide-y divide-border`. Full-width rows. Max content width `max-w-2xl`.
- **Row structure:** Icon well (40×40px, `bg-primary-ghost`, `text-primary`, 8px radius) + label (14.5px, 500) + description (13px, muted) + chevron. Flex row, `gap: 16px`, `py: 14px`.
- **Icon state:** At rest: primary-ghost bg, primary text. On hover: solid primary bg, white text. Transition: 150ms ease-out.
- **Label state:** At rest: `ink`. On hover: `primary`. Transition: 150ms.
- **Chevron:** `border-strong` at rest → `primary` on hover.

## 6. Do's and Don'ts

### Do:
- **Do** use `muted` (`oklch(0.44 0.010 292)`) as the floor for secondary and placeholder text. Never go lighter — that's where readability breaks.
- **Do** apply `text-wrap: balance` to all `heading`-role elements. Thai headings wrap unpredictably without it.
- **Do** use white text on any filled violet or amber element.
- **Do** keep shadows hue-cast to `292` (the ink hue). All shadows use `oklch(0.17 0.012 292 / α)`. Never generic `rgba(0,0,0,α)`.
- **Do** respect the 6px control radius everywhere without exception. One consistent radius is more trustworthy than varied radii.
- **Do** include all six interactive states for every new component: default, hover, focus, active, disabled, error.
- **Do** use Sarabun at weight 400 for body and 600 for headings/titles.

### Don't:
- **Don't** let the interface read as "the generic Tailwind starter." Every screen should have violet present in at least one interactive element.
- **Don't** mimic Workday or BambooHR: heavy sidebars, indigo-gradient nav, cluttered chrome, dated SaaS UI.
- **Don't** use `border-left` greater than 1px as a coloured accent stripe on cards, alerts, or list items. Rewrite with a background tint or leading icon instead.
- **Don't** use gradient text (`background-clip: text`). Emphasis lives in weight or size, never gradient.
- **Don't** add shadows to cards at rest. Only interaction states earn shadow.
- **Don't** use a second sans-serif for display headings. Sarabun at multiple weights — product register discipline.
- **Don't** apply negative `letter-spacing` to Thai text. Glyph joining breaks below `0em`.
- **Don't** use accent amber (`oklch(0.72 0.14 75)`) for decoration. It is a semantic signal: warnings, status, non-critical alerts only.
- **Don't** set placeholder text lighter than `muted`. Accessibility requires ≥4.5:1 for placeholder text.
- **Don't** ship components with loading/error states unhandled. Skeleton states for async content; inline error under inputs.
