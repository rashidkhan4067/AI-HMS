# Material Design 3 Theme Architecture: Tokens & Custom Overrides

---
**Metadata**
- **Document Version:** 1.1 (Milestone 1 Completed)
- **Primary Framework:** Material-UI (MUI v9)
- **Design Tokens:** Material Design 3 (M3)
- **Status:** APPROVED
---

## 1. Visual Colors & Palette Tokens

The UI color system complies with Material Design 3, optimized for clinic and hospital dashboard environments.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Color Palette Tokens                          │
│                                                                         │
│   Primary (Clinical Teal)       Secondary (Mint Green) Background       │
│   ┌────────────────────────┐   ┌───────────────────┐  ┌─────────────┐   │
│   │ Main: #006A6A          │   │ Main: #4DB6AC     │  │ Paper:      │   │
│   │ Light: #E0F2F1         │   │ Light: #B2DFDB    │  │ #f3f4f9     │   │
│   │ Dark: #004F4F          │   │ Dark: #004D40     │  │ Default:    │   │
│   └────────────────────────┘   └───────────────────┘  │ #fdfcff     │   │
│                                                       └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Typographic Scale Configuration (Outfit & DM Sans)

The custom typography settings in [`typography.js`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/app/theme/typography.js) use the `Outfit` and `DM Sans` font families.

```javascript
export const typography = {
    fontFamily: '"Outfit", "DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '57px', fontWeight: 400, letterSpacing: '-0.25px', lineHeight: 1.12 },
    h2: { fontSize: '32px', fontWeight: 400, letterSpacing: '0px', lineHeight: 1.25 },
    h3: { fontSize: '22px', fontWeight: 500, letterSpacing: '0px', lineHeight: 1.27 },
    body1: { fontSize: '16px', fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.5 },
    body2: { fontSize: '14px', fontWeight: 400, letterSpacing: '0.25px', lineHeight: 1.43 },
    button: { fontSize: '14px', fontWeight: 500, letterSpacing: '0.1px', textTransform: 'none' },
};
```

---

## 3. Spacing & Shape Guidelines

- **Base Factor Spacing:** The application implements an 8pt layout grid. In MUI configurations, `theme.spacing(1)` equals `8px`, and `theme.spacing(2)` equals `16px`.
- **Shape Tokens:** Component container corners follow the M3 rounded standard:
  - **Inputs / TextFields:** `8px` corner radius.
  - **Cards / Form Panels:** `16px` corner radius.
  - **Buttons / Actions:** `20px` corner radius (stadium pill shape).
  - **Dialogs / Modals:** `24px` corner radius (applied for high elevation).

---

## 4. Component Styles (MUI Overrides)

MUI components are customized globally in [`theme/index.js`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/app/theme/index.js) to enforce the visual styling without requiring inline CSS overrides:

- **MuiButton:** Disables shadow elevations (`disableElevation: true`) to maintain the flat M3 look. Applies custom padding and fully rounded corners.
- **MuiCard:** Removes default box shadows, applies a thin border (`1px solid rgba(0, 0, 0, 0.08)`), and sets the background to `palette.background.default` for crisp contrast against `palette.background.paper`.
- **MuiTextField:** Defaults to `variant: 'outlined'` and spans 100% width (`fullWidth: true`).
- **MuiDialog:** Elevates border-radius to `24px` with a default padding of `16px`.
