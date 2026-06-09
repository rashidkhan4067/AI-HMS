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

The baseline typography settings are defined in [`typography.js`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/app/theme/typography.js), but are extended in [`theme/index.js`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/app/theme/index.js) to enforce `'DM Sans'` across all components:

```javascript
// Extended configuration in theme/index.js:
typography: {
    ...typography,
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    h1: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: '-0.5px' },
    h2: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
    h3: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600 },
    body1: { fontFamily: "'DM Sans', sans-serif" },
    body2: { fontFamily: "'DM Sans', sans-serif" },
    button: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: 'none' },
}
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
