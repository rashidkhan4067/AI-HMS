# User Interface Design & Execution Standards

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Primary Typeface:** Outfit Font
- **Design System:** Material Design 3 (M3)
- **Status:** APPROVED
---

## 1. Theme Configuration Strategy

The visual engine is built on **Material-UI (MUI v9)**, implementing a centralized `ThemeProvider` loaded in `App.jsx`.
- **Zero Inline Hex Constants:** Hardcoding hex values or colors directly in components is prohibited. All UI elements must consume tokens from the `theme.palette` object.
- **Visual Styles:**
  - **Light Mode (Default):** Crisp white surfaces (`#fdfcff`) resting on container surfaces (`#f3f4f9`).
  - **Dark Mode (Future):** Infrastructure must support theme switching by using token keys instead of static values.

---

## 2. Color Classification & System Tokens

The application uses functional color categories to convey meaning:
- **Primary (`palette.primary`):** Main clinic identity (`#006A6A`). Used for primary actions, navigation, and active indicators.
- **Secondary (`palette.secondary`):** Mint Green accent (`#4DB6AC`). Used for badges and status indicators.
- **Success (`palette.success`):** Clinical green (`#146c2e`). Confirms completed operations or active slots.
- **Warning (`palette.warning`):** Amber (`#ffb400`). Highlights pending status or missing parameters.
- **Error (`palette.error`):** Crimson (`#ba1a1a`). Signals validation errors, access denied page indicators, and destructive triggers.

---

## 3. Typographic Scaling (Outfit Typeface)

The application uses the `Outfit` font family. We import specific CSS files for weights `300` (Light), `400` (Regular), `500` (Medium), and `700` (Bold) to support proper font weights:

- **Display Large (Hero/Page Headers):** `32px` size, `400` weight, letter spacing `0px`.
- **Title Large (Card / Section Headers):** `22px` size, `500` weight, letter spacing `0px`.
- **Body Large (Input Fields, Reading Text):** `16px` size, `400` weight, letter spacing `0.5px`.
- **Body Medium (Table Data, Description Text):** `14px` size, `400` weight, letter spacing `0.25px`.
- **Label Large (Buttons, Navigation items):** `14px` size, `500` weight, letter spacing `0.1px` (text transform: none).

---

## 4. UI Input Validation & Feedback

All user forms must display clear interactive states:
- **Labels:** Text labels must remain visible on focus.
- **Placeholders:** Text fields must supply context examples.
- **Alert Banners:** Authentication and validation errors must render in high-contrast Material `Alert` boxes using functional error/success color tokens.
- **Outlined Styling:** TextFields default to `variant="outlined"` with a container border-radius of `8px`.

---

## 5. Accessibility Benchmark (WCAG 2.1 AA)

- **Contrast Ratios:** Text and interactive indicators must meet a contrast ratio of at least `4.5:1` against their backgrounds.
- **Visible Focus States:** Keyboard focus indicators must never be disabled via CSS `outline: none`. Standard MUI focus indicators are preserved.
- **Screen Reader Helpers:** Icon-only buttons (like password visibility toggles or close icons) must include descriptive `aria-label` tags.
- **Action Touch Targets:** Interactive button components require a minimum height of `40px` for reliable mobile tap interactions.
