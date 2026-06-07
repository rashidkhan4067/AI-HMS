# Platform Design System: Design Tokens & Visual Specs

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Specification:** Material Design 3 (M3)
- **Primary Typeface:** Outfit Font
- **Status:** APPROVED
---

## 1. Color System & Contrast Tokens

The application employs Material Design 3 color palettes optimized for clinical utility. Colors are divided into primary actions, secondary markers, backgrounds, and warning/error status states.

### 1.1 Color Palette Table
- **Primary (Clinical Teal):** `#006A6A` (Main), `#E0F2F1` (Light - Container), `#004F4F` (Dark).
- **Secondary (Mint Green):** `#4DB6AC` (Main), `#B2DFDB` (Light), `#004D40` (Dark).
- **Success (Green):** `#146c2e` (Main).
- **Warning (Amber):** `#ffb400` (Main).
- **Error (Crimson):** `#ba1a1a` (Main), `#ffdad6` (Light).
- **Background:** `#fdfcff` (Default - Pure surface), `#f3f4f9` (Paper - Surface Container).

---

## 2. Typographic Scales (Outfit)

Legibility is key in healthcare portals. We utilize the `Outfit` typeface with strict sizes and weights:

- **Display Large (Page Titles):** `32px` size, `400` weight, letter spacing `0px`.
- **Title Large (Section/Card Headers):** `22px` size, `500` weight, letter spacing `0px`.
- **Body Large (Inputs/Core text):** `16px` size, `400` weight, letter spacing `0.5px`.
- **Body Medium (Small Labels/Helper Text):** `14px` size, `400` weight, letter spacing `0.25px`.
- **Label Large (Button Text):** `14px` size, `500` weight, letter spacing `0.1px`, no uppercase transform.

---

## 3. Spacing Grid (8pt Baseline)

Layout paddings and margins must conform strictly to the 8pt spacing grid. Do not inject arbitrary spacing metrics.

- **4px (`theme.spacing(0.5)`):** Micro elements spacing (icon to text spacing).
- **8px (`theme.spacing(1)`):** Standard field-to-field spacing.
- **16px (`theme.spacing(2)`):** Card interior paddings, margins.
- **24px (`theme.spacing(3)`):** Standard page grid margin gaps.
- **32px (`theme.spacing(4)`):** Core section margin separations.

---

## 4. Container Shapes (Border Radius)

Curvatures communicate interactivity and follow M3 shape tokens:
- **Small (`8px`):** Inputs, TextFields, search boxes.
- **Medium (`12px`):** Small cards, alerts, message blocks.
- **Large (`16px`):** Master cards, layouts.
- **Pill (`20px`):** Buttons, action chips (stadium shape).
- **Dialog (`24px`):** High elevation modals.

---

## 5. Depth System (Elevations)

Shadow tokens are used to represent structural levels along the Z-axis:
- **Level 0 (Flat):** Standard inline components, text inputs. Uses background contrast instead of shadows.
- **Level 1 (Inline Cards):** Border-radius `16px`, thin outline (`1px solid rgba(0,0,0,0.08)`), shadow `none`.
- **Level 2 (Popups/Dropdowns):** Shadow representation `0px 2px 6px rgba(0, 0, 0, 0.15)`.
- **Level 3 (Modals/Dialogs):** Border-radius `24px`, shadow representation `0px 8px 24px rgba(0, 0, 0, 0.2)`.
