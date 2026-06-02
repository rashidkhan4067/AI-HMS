# Material Design 3 Theme Architecture

**Project:** AI Hospital Management System (AI-HMS)  
**Role:** Senior UI Architect  
**Framework:** Material-UI (MUI v5)  

---

## 1. Complete Color Palette (M3 Healthcare SaaS)
The color palette uses exact hex codes designed for high contrast and clinical precision.

*   **Primary (Healthcare Blue):**
    *   `main`: `#005ac1`
    *   `light`: `#d8e2ff` (Primary Container)
    *   `dark`: `#00418c`
*   **Secondary (Teal):**
    *   `main`: `#006a60`
    *   `light`: `#74f8e5` (Secondary Container)
    *   `dark`: `#005048`
*   **Error (Crimson Red):**
    *   `main`: `#ba1a1a`
    *   `light`: `#ffdad6`
*   **Warning (Amber):**
    *   `main`: `#ffb400`
*   **Success (Green):**
    *   `main`: `#146c2e`
*   **Background (Surfaces):**
    *   `default`: `#fdfcff` (Pure surface)
    *   `paper`: `#f3f4f9` (Surface Container Lowest)

## 2. Typography Scale
Using the `Roboto` typeface, adhering strictly to M3 tracking and leading.

*   `h1` (Display Large): `57px`, 400 weight, `-0.25px` letter spacing.
*   `h2` (Headline Large): `32px`, 400 weight, `0px` letter spacing.
*   `h3` (Title Large): `22px`, 500 weight, `0px` letter spacing.
*   `body1` (Body Large): `16px`, 400 weight, `0.5px` letter spacing.
*   `body2` (Body Medium): `14px`, 400 weight, `0.25px` letter spacing.
*   `button` (Label Large): `14px`, 500 weight, `0.1px` letter spacing.

## 3. Spacing System
A strict `4px` baseline grid system. MUI will be configured with a spacing factor of `4`.
Tokens: `theme.spacing(1)` = `4px`, `theme.spacing(2)` = `8px`, `theme.spacing(4)` = `16px`.

## 4. Elevation System
Shadows are minimized. Depth is communicated primarily through surface colors and borders.
*   `elevation: 0` -> Flat, inline content.
*   `elevation: 1` -> Cards, basic containers (`0px 1px 3px rgba(0,0,0,0.12)`).
*   `elevation: 4` -> Floating Action Buttons, Dialogs.
*   `elevation: 8` -> Navigation Drawers, Modals.

## 5. Theme Architecture & Tokens
The theme is isolated in `src/app/theme.js`. It utilizes **Design Tokens** (e.g., standardizing border-radius across all components via `theme.shape.borderRadius`).

## 6. Component Styling Guidelines (M3 Overrides)
MUI default components are overridden globally to achieve the M3 look without requiring inline styles.
*   **Buttons:** Fully rounded (pill-shape) with `borderRadius: 20px`. Minimum height `40px`. No uppercase text transformation.
*   **Cards:** Rounded corners (`16px`), zero elevation default (relies on surface color contrast), slight border.
*   **Inputs (TextFields):** Outlined variant forced by default, `8px` border radius.

---

## 7. Production-Ready Code Example (`theme.js`)
*(This configuration has been directly injected into `frontend/src/app/theme.js`)*
