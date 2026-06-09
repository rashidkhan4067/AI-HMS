# UI/UX Design Specification: Visual System & Layout Guidelines

---
**Metadata**
- **Document Version:** 1.1 (Milestone 1 Completed)
- **Design Framework:** Material Design 3 (M3) & Glassmorphic Accent Layers
- **Primary Typeface:** Outfit & DM Sans Fonts
- **Status:** APPROVED
---

## 1. Design Language & Framework

AI-HMS implements Google's **Material Design 3 (M3)** spec combined with modern **glassmorphic containers** (backdrop filters, semi-transparent overlays, and neon glows) to create a premium clinical experience. The user interface uses flat visual containers, high contrast, and dynamic depth markers to reduce eye strain in clinical environments.

---

## 2. Color System (Clinical Healthcare Theme)

The application uses specific design tokens to manage backgrounds, primary markers, and error indicators.

| Token Name | Hex Code / Styles | Canvas Context |
|:---|:---|:---|
| **`Primary`** | `#006A6A` | Main clinical teal brand, primary buttons, active indicators. |
| **`Primary Light`** | `rgba(0, 106, 106, 0.1)` | Active navigation drawer button backgrounds / hover fills. |
| **`Secondary`** | `#4DB6AC` | Success badges, check-in markers, secondary accents. |
| **`Error`** | `#ba1a1a` | Warning text, password errors, access deined states. |
| **`Surface Default`**| `#fdfcff` (Light) / `#0F1515` (Dark) | Primary background canvas. |
| **`Surface Container`**| `#f3f4f9` (Light) / `#161D1D` (Dark) | Inner cards, text inputs background. |
| **`Glass Card`** | `bg-white/10` with `backdrop-filter: blur(8px)` | Premium left-panel illustration container. |

---

## 3. Typographic Scale (Outfit & DM Sans)

To guarantee legibility, the application imports `@fontsource/outfit` and `@fontsource/dm-sans` applying specific sizing tokens:

- **Display Large (Page Headers):** `32px` size, `400` weight, Outfit.
- **Title Large (Card Titles):** `22px` size, `500` weight, Outfit.
- **Body Large (Inputs/Paragraphs):** `16px` size, `400` weight, DM Sans.
- **Body Medium (Small Labels/Helper Text):** `14px` size, `400` weight, DM Sans.
- **Label Large (Buttons):** `14px` size, `500` weight, DM Sans (no uppercase transform).

---

## 4. Key Customized UI Components

### 4.1 Split-Panel Onboarding Layout (`AuthLayout.jsx`)
- **Layout:** On desktops, a visual split-panel layout: a left panel (`BrandPanel`) taking 42% width and a right panel taking 58% containing the form card.
- **Background Details:** Fluent-style geometric background grids and line patterns rendered via inline SVG vectors.

### 4.2 Dynamic Contextual Brand Panel (`BrandPanel.jsx`)
- **Visuals:** A deep-teal (`#0D3D38`) sidebar rendered on large displays containing customized headers, checklists, and stats grids based on the active route:
  - **Login:** Displays a 2x3 statistics grid outlining hospital KPIs ("1,200+ Patients", "99.9% Uptime", "50+ Doctors", etc.).
  - **Register:** Displays a checkmark list of clinical features ("Unified patient records", "AI-assisted scheduling").
  - **Forgot Password / Reset Password:** Displays checklists for password strength and security protocols.
  - **OTP Verification:** Displays verification metrics ("valid for 30s", "6 digits").

### 4.3 Step Progress Bar (`StepProgressBar.jsx`)
- **Layout:** A linear stepper indicating progress in multi-step workflows (e.g. 3-step Patient Registration, 3-step Doctor Application).
- **Responsive Alignment:** To prevent step label text (such as "Account Security" or "Review & Submit") from clipping on narrow cards:
  - First step label: Aligns to the left edge of its node (`left: 0`, `textAlign: 'left'`).
  - Last step label: Aligns to the right edge of its node (`right: 0`, `left: 'auto'`, `textAlign: 'right'`).
  - Middle step labels: Center-aligned (`left: '50%'`, `transform: 'translateX(-50%)'`).

### 4.4 Global Loader Overlay (`GlobalLoader.jsx`)
- **Visuals:** Full screen glassmorphic loading overlay. Renders a slow-rotating dotted outer ring, a neon-glowing inner rotating ring, and a centered glass sphere containing the clinical `BrandLogo` which pulses via a **double-contraction heartbeat animation**.
- **Usage:** Automatically displayed during application initialization checks and registration loading hooks.

### 4.5 Cookie Consent Banner (`CookieConsent.jsx`)
- **Triggers:** Displays only on the landing/login pages (`/`, `/login`) for first-time visitors using local storage keys.
- **Visuals:** Slide-up transition, customizable toggles for analytical cookies, and a high contrast Accept All button (dark gray `#1F2937` in light mode, light gray/white `#F4F4F5` in dark mode) for excellent visual readability.

### 4.6 Theme Mode Context (`ThemeModeContext.jsx`)
- **Visuals:** Implements theme toggling (light/dark mode) utilizing MUI's theme configuration context, updating background colors, text contrast, borders, and input fields globally.

### 4.7 Blocked Register View (`BlockedRegisterView.jsx`)
- **Visuals:** Displayed when users attempt to self-register as clinical staff (which is blocked by zero-trust constraints). Renders a warning panel directing doctors to apply via the onboarding application form, and other staff to request an invitation from their administrator.

---

## 5. Navigation Architecture

### 5.1 Drawer Layout Modes
- **Desktop (Breakpoint $\ge$ 905px):** Pinned, persistent navigation drawer (`width: 240px`) on the left side of the dashboard, leaving 100% width for the main routing outlet.
- **Mobile (Breakpoint $<$ 905px):** Modal slide-out drawer triggered from the top app bar hamburger menu icon.

---

## 6. Security & Access Denied Layout (Forbidden Page)

When users navigate to a dashboard area barred by RBAC roles, they are redirected to `/forbidden` instead of silently bouncing.

- **Component:** `ForbiddenPage.jsx`
- **Visuals:**
  - Centered layout containing a large warning badge (`GppBadIcon`, `error.main` color, `80px` size).
  - Clear, non-technical explanation: *"You do not have the required permissions to view this page."*
  - Re-routing CTA: A primary `contained` button leading back to the home dashboard (`/dashboard`).
- **Access Rule:** Accessible to all authenticated users.
