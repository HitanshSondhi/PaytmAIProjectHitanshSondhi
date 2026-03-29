# Design System: Midnight Control Room

## 1. Overview & Creative North Star

### Creative North Star: "The Kinetic Observatory"
This design system moves away from the static, boxy layouts of traditional fintech and toward a "Kinetic Observatory" aesthetic. It imagines the financial AI not as a spreadsheet, but as a high-end command center. We achieve a premium, Y2025 feel by prioritizing **Atmospheric Depth** over structural rigidity. 

To break the "template" look, we utilize **Intentional Asymmetry**. Large-scale typography is often offset, and components do not always align to a predictable 12-column grid. Instead, we use overlapping glass layers and generous negative space to create a sense of vastness and sophistication.

---

## 2. Colors & Surface Logic

The palette is rooted in the deep void of `#080810`, utilizing a hierarchy of tonal shifts rather than lines to define space.

### The "No-Line" Rule
**1px solid borders are strictly prohibited for sectioning.** To define a boundary, you must use a background color shift. For example, a `surface-container-low` module sitting on a `surface` background provides all the separation a sophisticated eye needs.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of smoked glass. 
- **Base Level:** `surface` (#13131b) – The foundational "floor."
- **De-emphasized:** `surface-container-low` (#1b1b23) – For subtle background groupings.
- **Active Level:** `surface-container` (#1f1f28) – Standard card and module background.
- **Prominent:** `surface-container-high` (#292932) – For elevated interactions or modals.

### The "Glass & Gradient" Rule
To inject "soul" into the machine, use **Sovereign Indigo** and **Violet Oracle** gradients. 
- **CTAs:** Transition from `primary` (#c3c0ff) to `primary-container` (#5048e5) at a 135° angle.
- **Ambient Glows:** Use 20% opacity radial gradients of `tertiary_container` in the corners of the viewport to simulate light bleed from a control console.

---

## 3. Typography

We use **Space Grotesk** exclusively. Its tabular-leaning proportions feel engineered yet approachable, perfect for high-velocity financial data.

| Level | Token | Size | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | -0.02em | 700 (Bold) |
| **Headline** | `headline-md` | 1.75rem | -0.01em | 500 (Medium) |
| **Title** | `title-lg` | 1.375rem | 0 | 500 (Medium) |
| **Body** | `body-md` | 0.875rem | +0.01em | 400 (Regular) |
| **Label** | `label-md` | 0.75rem | +0.03em | 600 (Semi-Bold) |

**Editorial Note:** Use `display-lg` sparingly for impact—pair it with `body-md` for high-contrast, editorial-style layouts that feel like a premium financial report rather than a dashboard.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` (#0d0d16) card inside a `surface-container` (#1f1f28) section to create a "recessed" look for data tables.

### Ambient Shadows
For floating elements (modals, dropdowns), use an **Extra-Diffused Cobalt Shadow**:
- `box-shadow: 0 24px 80px -12px rgba(80, 72, 229, 0.08);`
This shadow is tinted with our primary Cobalt, mimicking the way light behaves in a dark room.

### Glassmorphism
Floating headers and sidebars must utilize:
- `background: rgba(31, 31, 40, 0.65);` (Surface-container at 65%)
- `backdrop-filter: blur(20px) saturate(180%);`
This ensures the "Midnight" vibe remains cohesive as users scroll.

---

## 5. Components

### Buttons
- **Primary:** Gradient from `primary` to `primary-container`. `md` (1.5rem) roundedness. No border.
- **Secondary:** `surface-container-highest` background. Text in `on_surface`.
- **Tertiary:** No background. `on_surface_variant` text. High-contrast hover state using `primary_fixed`.

### Input Fields
- **Base:** `surface-container-lowest` background. 
- **Border:** Use the "Ghost Border"—`outline-variant` at 15% opacity.
- **Active State:** Shift background to `surface-container` and glow the "Ghost Border" to 40% opacity Cobalt.

### Cards & Lists
**Forbid the use of divider lines.** 
- Separate list items using `spacing.2` (0.7rem) of vertical whitespace. 
- For cards, use `md` (1.5rem) or `lg` (2rem) corner radii to create a friendly, high-end furniture feel.

### Financial Health Indicators (The Non-Traffic Palette)
Avoid Red/Green/Yellow. 
- **Positive/Growth:** `primary_fixed` (#e2dfff) - "The Light."
- **Neutral/Stable:** `outline` (#918fa1) - "The Fog."
- **Action Required/Risk:** `tertiary` (#cdbdff) - "The Oracle."

---

## 6. Do’s and Don’ts

### Do:
- **Use generous whitespace:** If a layout feels cramped, double the padding using `spacing.16` or `spacing.20`.
- **Embrace Tonal Shifts:** Use `surface_bright` sparingly for hover states to make elements feel like they are "lighting up."
- **Layer your typography:** Use `label-sm` in all-caps with increased tracking for metadata to create an "instrument panel" look.

### Don't:
- **Don't use 1px solid borders.** If it looks like a spreadsheet, it’s wrong.
- **Don't use pure black (#000) or pure white (#FFF).** They are too harsh for the "Midnight" atmosphere. Use `surface_container_lowest` and `on_surface`.
- **Don't use standard "Drop Shadows."** If the shadow is grey and tight, it breaks the glassmorphic immersion. Always use diffused, tinted glows.
