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

### 4.1 Step Progress Bar
- **Component:** `StepProgressBar.jsx`
- **Layout:** A linear stepper displaying active pulses and connector lines.
- **Responsive Alignment:** To prevent step label text (such as "Account Security" or "Review & Submit") from clipping on narrow cards:
  - First step label: Aligns to the left edge of its node (`left: 0`, `textAlign: 'left'`).
  - Last step label: Aligns to the right edge of its node (`right: 0`, `left: 'auto'`, `textAlign: 'right'`).
  - Middle step labels: Center-aligned (`left: '50%'`, `transform: 'translateX(-50%)'`).

### 4.2 Dynamic Brand Illustration Widgets
- **Component:** `BrandIllustration.jsx`
- **Widgets:** Dynamic interactive dark-glass mock-ups matching the current user portal role context:
  - **Patient Widget**: ECG heartbeat graphs (animating SVG sparklines), live vital cards (BPM, SpO2), and appointment badges.
  - **Doctor Widget**: Specialist practice queue, consultations overview, active consult slots.
  - **Staff Widget**: Bed occupancy indicators, real-time hospital system operational terminal feed logs.
  - **General Widget**: Interconnected node maps showing security locks and HIPAA compliance.

### 4.3 Global Loader Overlay
- **Component:** `GlobalLoader.jsx`
- **Visuals**: Full screen glassmorphic transition loading overlay. Renders a slow-rotating dotted outer ring, a neon-glowing inner rotating ring, and a centered glass sphere containing the clinical `BrandLogo` which pulses via a **double-contraction heartbeat animation**.
- **Usage**: Automatically loaded during session checks and page registration loading hooks.

### 4.4 Cookie Consent Banner
- **Component:** `CookieConsent.jsx`
- **Triggers**: Displays only on the landing/login pages (`/`, `/login`) for first-time visitors using local storage keys.
- **Visuals**: Slide-up transition, customizable toggles for analytical cookies, and a high contrast Accept All button (dark gray `#1F2937` in light mode, light gray/white `#F4F4F5` in dark mode) for excellent visual readability.

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
