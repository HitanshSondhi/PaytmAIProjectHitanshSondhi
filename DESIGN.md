# Design System: Voice Ledger — Paytm Merchant Assistant
**Project IDs:**
- Voice Ledger UI (Desktop/Mobile/Tablet): `8250373536698689042`
- Merchant Ledger Dashboard (Latest): `3863112758345667218`
- Voice Ledger Fintech UI Redesign (Mobile): `4668927651521580962`

---

## 1. Visual Theme & Atmosphere

The Voice Ledger design system is built around a single Creative North Star: **"The Digital Concierge."** The interface must feel invisible yet omnipresent — like a trusted financial advisor that listens before it speaks. The mood is **editorial, serene, and authoritative**, eschewing the cluttered utility of traditional fintech dashboards in favor of a high-end, gallery-like experience where data breathes.

The primary aesthetic is **Intentional Asymmetry combined with Tonal Depth.** Rather than rigid grid layouts, content floats in nested glass containers with expansive whitespace. The dark-mode variant (Merchant Ledger Dashboard) channels a **sophisticated Midnight Control Room** vibe — deep space indigos against near-black surfaces, making every data point feel premium. The light-mode variant (Voice Ledger UI / Fintech Redesign) reads as **Crisp Editorial Finance** — clean whites offset by soft indigo blues.

**Defining characteristics across all variants:**
- No hard borders or 1px divider lines. Separation is achieved purely through tonal surface shifts.
- Glassmorphism for the active voice state — the UI becomes alive when the user speaks.
- Motion is gentle and purposeful: a soft pulse on the voice button, wave-like ripples for audio feedback.

---

## 2. Color Palette & Roles

### Primary Palette — Deep Indigo Authority

| Descriptive Name | Hex | Functional Role |
|---|---|---|
| **Sovereign Indigo** | `#2b3896` | Primary brand color; sidebar active states, key CTA text |
| **Deep Navy Velvet** | `#001645` | Darkest primary; hero text, top-level financial figures |
| **Corporate Midnight** | `#001849` | Used for `on-primary-fixed` text on light surfaces |
| **Electric Indigo (Dark)** | `#5048e5` | Merchant Dashboard accent; icon highlights, active nav tabs |
| **Indigo Gradient End** | `#4551af` | Gradient terminus of `primary-container`; CTA button depth |

### Surface Palette — Layered Vellum

| Descriptive Name | Hex | Functional Role |
|---|---|---|
| **Polar White** | `#ffffff` | Top-layer cards, maximum pop, transaction rows |
| **Gossamer White** | `#f7f9fb` | Base page background (light mode) |
| **Soft Cloud** | `#f2f4f6` | Low-level containers, sidebar backgrounds |
| **Frosted Steel** | `#eceef0` | Mid-level groupings, secondary panels |
| **Muted Silver** | `#e0e3e5` | Subtle borders (ghost variant only, at 15% opacity) |

### Accent & Semantic Palette

| Descriptive Name | Hex | Functional Role |
|---|---|---|
| **Violet Oracle** | `#5500bc` / `#7C3AED` | Voice interface; tertiary CTA, active voice button glow |
| **Lavender Glass** | `#6f28e0` | Voice container background when active |
| **Cobalt Wave** | `#4552c3` | Secondary color; tag labels, link accents |
| **Crimson Alert** | `#ba1a1a` | Error states only — used sparingly |
| **Blush Error Container** | `#ffdad6` | Error background containers |

### Text Palette

| Descriptive Name | Hex | Functional Role |
|---|---|---|
| **Obsidian Soft** | `#191c1e` | Primary body text (never pure black) |
| **Slate Mist** | `#454652` | Secondary/supporting text, descriptions |
| **Steel Ghost** | `#757684` | Tertiary metadata, timestamps |

---

## 3. Typography Rules

The system uses a **dual-font editorial hierarchy** that balances character with data density.

### Font Families

| Context | Family | Character |
|---|---|---|
| **Headlines (Light Mode)** | Manrope | Geometric, confident; used for balances and section anchors |
| **Body & Data (Light Mode)** | Inter | Precision-engineered; high legibility at small sizes |
| **Merchant Dashboard** | Space Grotesk | Technical personality with a human edge; used across all weights |
| **Fintech Redesign** | Inter (all levels) | Maximum readability for dense financial data |

### Scale & Usage

| Level | Size | Weight | Notes |
|---|---|---|---|
| `display-lg` | 3.5rem | 700 | Primary account balances (`$12,480.00`). Letter spacing: `-0.02em`. Non-negotiable. |
| `headline-md` | 1.75rem | 600 | Section headers like "Recent Activities," "Voice Summary." |
| `title-lg` | 1.375rem | 600 | Card titles, merchant names, transaction categories. |
| `body-md` | 0.875rem | 400 | Transactional descriptions, supporting copy. |
| `label-sm` | 0.6875rem | 500 | Timestamps, tags. All-caps with `+0.05em` letter spacing. |

**The Amount Rule:** All financial figures at `display` and `headline` levels must use `-0.02em` letter spacing to feel authoritative and locked-in.

---

## 4. Component Stylings

### Buttons

- **Primary CTA:** Pill-shaped (`border-radius: 1.5rem`). Filled with a 135° linear gradient from **Sovereign Indigo** (`#2b3896`) to **Indigo Gradient End** (`#4551af`). Height: 3.5rem. No border. Subtle glow on hover using `box-shadow: 0 8px 24px rgba(43, 56, 150, 0.35)`.
- **Voice Trigger Button:** Round (`border-radius: 50%`). Filled with **Violet Oracle** (`#5500bc`). A continuous soft pulse animation (0.5s ease-in-out) expands an outer ring from `#6f28e0` at 30% opacity when the mic is active.
- **Secondary / Utility:** Frosted Steel (`#eceef0`) background with **Obsidian Soft** (`#191c1e`) text. Generously rounded corners (12px). No border.
- **Ghost / Tertiary:** No background, no border. **Slate Mist** (`#454652`) text. Used for "Cancel," "Back," or navigation labels.

### Cards & Containers

- **Standard Card:** Polar White (`#ffffff`) background on a Soft Cloud (`#f2f4f6`) parent. Generously rounded corners (`border-radius: 1.5rem`, 24px). Elevation achieved with ambient shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`. No visible border.
- **Voice Active Glass Overlay:** `backdrop-filter: blur(20px)` with `tertiary-container` (`#6f28e0`) at 8% opacity. This is the signature glassmorphism treatment — the ledger data is visible through the active voice interface.
- **Transaction Row:** No dividers between rows. Items separated by `1.4rem` vertical whitespace. Alternating fills between Polar White and Gossamer White for subtle rhythm without lines.
- **Dark Mode Card (Merchant Dashboard):** Deep charcoal near-black surface with Cobalt Wave (`#5048e5`) and Space Grotesk labels. Elevation from inner glow rather than shadow.

### Inputs & Forms

- **No boxed inputs.** Forms use either a "Soft Underline" style (single bottom border at 15% `outline-variant` opacity) or a rounded container of `surface-container-high` (`#e6e8ea`) with no visible border.
- **Active / Focused State:** Container transitions to `primary-fixed` (`#dfe0ff` / `#dae1ff`) at 20% opacity with a soft indigo underline.
- **Voice Input Field (Custom Component):** Instead of a text box, a **Dynamic Waveform Container** using `tertiary-fixed-dim` color expands organically as the user speaks, reflecting the Digital Concierge persona.

### Navigation

- **Desktop Sidebar:** Uses `surface-container` background. Active nav item highlighted with `primary-container` background at 100% and Polar White icon/label. Inactive items use Steel Ghost (`#757684`) icons.
- **Mobile Bottom Nav:** Icon + label layout. Active tab uses **Sovereign Indigo** fill. Inactive tabs use ghost icon treatment.

---

## 5. Layout Principles

### The Editorial Whitespace Rule
Generosity with space is a brand statement. The minimum section padding is `2.5rem` (`spacing-10`). Components within a section maintain `1rem` gaps (`spacing-4`). Conceptual groups (e.g., "voice controls" vs. "transaction list") are separated by `2rem` (`spacing-8`) without any dividing line.

### The No-Line Rule (Strictly Enforced)
**Explicit prohibition:** 1px solid borders for structural separation are forbidden. All visual separation must come from:
1. **Background Tonal Shifts** — e.g., Soft Cloud section on a Gossamer White page.
2. **Vertical Whitespace** — Generous `spacing-4` between list items.
3. **Zebra-Tinting** — Alternating between `surface-container-lowest` and `surface` for data rows.

### Asymmetry & Depth
Cards and content blocks do not sit in a rigid centered grid. Key elements may overlap: a summary card can bleed off the right edge of a panel, suggesting "more content." The hero balance figure (`display-lg`) acts as a typographic anchor — large and left-aligned — while secondary controls float in glass panels to the right.

### Responsive Behavior
- **Desktop (1280–2560px):** Two or three column layout. Sidebar fixed at ~240px. Main content area uses the full remaining width. Voice controls occupy a persistent floating card.
- **Tablet (768–1279px):** Collapsible sidebar. Content stacks into 2 columns. Glassmorphism overlay for voice modal.
- **Mobile (< 768px):** Single-column stack. Bottom navigation bar. Voice trigger becomes a full-width floating action area pinned above the nav bar.

### Shadow Philosophy
Shadows are **ambient and blue-tinted**, never grey:
- Floating elements: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06)`
- Voice active modal: `box-shadow: 0 8px 32px rgba(85, 0, 188, 0.18)` — a violet halo
- **Forbidden:** Standard grey drop shadows (`rgba(0,0,0,0.25)`) are strictly prohibited. If it doesn't feel like the element is naturally floating or softly glowing, the shadow is too heavy.

---

## 6. Do's and Don'ts

### ✅ Do
- Use `on-surface` (`#191c1e`) for all body text — never pure black `#000000`.
- Use `roundedness-xl` (1.5rem / 24px) for main containers and CTA buttons.
- Add `spacing-16` (5.5rem) or more for hero section top margins to create editorial breathing room.
- Overlap elements (e.g., a floating voice card slightly overlapping a balance section header) to create natural depth.
- Use a blue-tinted ambient shadow; the shadow color should echo the surface or accent color, not neutral grey.

### ❌ Don't
- Don't use 1px solid borders to separate sections or rows — ever.
- Don't use "traffic light" color conventions (red/green for good/bad). Use the sophisticated indigo and violet variants instead.
- Don't use sharp corners. Anything below `0.5rem` (8px) border radius is prohibited.
- Don't use flat, colored backgrounds for primary buttons. Always use the gradient.
- Don't use heavyweight drop shadows. If it casts a harsh edge, it's the wrong shadow.
