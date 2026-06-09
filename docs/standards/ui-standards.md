# User Interface Design & Execution Standards

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Primary Typefaces:** DM Sans (MUI theme) & Outfit (Branding)
- **Design System:** Material Design 3 (M3)
- **Status:** APPROVED
---

## 1. Theme Configuration Strategy

The visual engine is built on **Material-UI (MUI v9)**, implementing a centralized `ThemeProvider` and mode context (`ThemeModeContext.jsx`) loaded in `App.jsx`.
- **Zero Inline Hex Constants:** Hardcoding hex values or colors directly in components is prohibited. All UI elements must consume tokens from the `theme.palette` object.
- **Visual Theme Modes:**
  - **Light Mode (Default):** Crisp white surfaces (`#FFFFFF`) resting on container background surfaces (`#F4FBFB`), brand primary (`#006A6A`).
  - **Dark Mode:** Deep clinical dark surface default (`#0F1515`) resting on elevated cards (`#181F1F`), readable teal primary (`#9CF1F0`).

---

## 2. Color Classification & System Tokens

The application uses functional color categories to convey meaning:
- **Primary (`palette.primary`):** Main clinic identity (`#006A6A` / `#9CF1F0`). Used for primary actions, navigation, and active indicators.
- **Secondary (`palette.secondary`):** Teal-grey / mint accent (`#4A6363` / `#B0CCCC`). Used for badges and status indicators.
- **Success (`palette.success`):** Clinical green (`#1D6B35` / `#68DDA1`). Confirms completed operations or active slots.
- **Warning (`palette.warning`):** Amber (`#7D5700` / `#FDB700`). Highlights pending status or missing parameters.
- **Error (`palette.error`):** Crimson (`#BA1A1A` / `#FFB4AB`). Signals validation errors, access denied page indicators, and destructive triggers.

---

## 3. Typographic Scaling (DM Sans Typeface)

The application uses the `DM Sans` font family for the MUI theme (with `@fontsource/outfit` used for logo and brand text):

- **Display Large (Hero/Page Headers):** `32px` size, `600` weight, letter spacing `-0.5px`.
- **Title Large (Card / Section Headers):** `22px` size, `600` weight, letter spacing `0px`.
- **Body Large (Input Fields, Reading Text):** `16px` size, `400` weight, letter spacing `0.5px`.
- **Body Medium (Table Data, Description Text):** `14px` size, `400` weight, letter spacing `0.25px`.
- **Label Large (Buttons, Navigation items):** `14px` size, `600` weight, letter spacing `0.1px` (text transform: none).

---

## 4. UI Input Validation & Feedback

All user forms must display clear interactive states:
- **Labels:** Text labels must remain visible on focus.
- **Placeholders:** Text fields must supply context examples.
- **Alert Banners:** Authentication and validation errors must render in high-contrast Material `Alert` boxes using functional error/success color tokens.
- **Outlined Styling:** TextFields default to `variant="outlined"` with a container border-radius of `12px` (rounded-xl) and input height of `44px` (h-11).

---

## 5. Accessibility Benchmark (WCAG 2.1 AA)

- **Contrast Ratios:** Text and interactive indicators must meet a contrast ratio of at least `4.5:1` against their backgrounds.
- **Visible Focus States:** Keyboard focus indicators must never be disabled via CSS `outline: none`. Standard MUI focus indicators are preserved.
- **Screen Reader Helpers:** Icon-only buttons (like password visibility toggles or close icons) must include descriptive `aria-label` tags.
- **Action Touch Targets:** Interactive button components require a minimum height of `48px` (WCAG 2.1 touch target) for reliable mobile tap interactions.

