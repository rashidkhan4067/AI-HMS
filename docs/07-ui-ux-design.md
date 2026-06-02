# UI/UX Design Specification: Authentication & Authorization

**Project:** AI Hospital Management System (AI-HMS)  
**Milestone:** 01 - Authentication & Authorization  
**Design System:** Google Material Design 3 (M3)  

---

## 1. Login Page Design
The login page acts as the secure entry point for the hospital system. It employs a clean, focused, and distraction-free layout to minimize cognitive load.
*   **Layout:** Centered Material Card (`elevated` variant) on a subtle primary-container background.
*   **Components:**
    *   **Hero:** Minimal AI-HMS logo/typography centered at the top of the card.
    *   **Fields:** Two Material `OutlinedTextField` components (Email, Password). The password field includes a trailing toggle icon (visibility/visibility-off).
    *   **Actions:** Primary `FilledButton` spanning 100% width for the "Login" action. A secondary `TextButton` below for "Forgot Password?" and "Register".
*   **Feedback:** Real-time validation errors appear below fields using the Material `Error` color token. Server-side errors appear as a `Snackbar` at the bottom of the screen.

## 2. Profile Page Design
The Profile Page allows users to view their basic identity and role assignments.
*   **Layout:** Standard dashboard content area with a top `TopAppBar` (Large variant).
*   **Components:**
    *   **Header:** User avatar (`large`) beside a Typography `HeadlineMedium` displaying `first_name` and `last_name`. A `Chip` component below the name displays the user's role (e.g., "Doctor" in secondary color).
    *   **Details List:** A Material `List` component displaying read-only data (Email, Role, Account Created Date).
    *   **Actions:** Floating Action Button (`FAB`) or an `OutlinedButton` to enter "Edit Mode" (future milestone).

## 3. Change Password Page Design
A highly secure, focused form for credential updates.
*   **Layout:** A focused card within the Profile settings sub-navigation.
*   **Components:**
    *   **Fields:** Three `OutlinedTextField` inputs: Current Password, New Password, Confirm New Password.
    *   **Helpers:** A helper text block beneath "New Password" tracking password strength (M3 dynamic color transitions from error-red to primary-green based on strength).
    *   **Actions:** `FilledButton` for "Update Password" (disabled until validation passes).

## 4. Dashboard Layout
The core layout wrapper applied once a user is authenticated.
*   **Layout Structure:** `NavigationDrawer` (Left) + `TopAppBar` (Top) + `MainContent` (Center-Right).
*   **TopAppBar:** Contains a hamburger menu (if drawer is dismissible), page title, and a profile avatar dropdown menu on the far right.
*   **Main Content:** Uses a maximum width container (`max-width: 1440px`) centered on larger screens, wrapped in an M3 `Surface` with `surface-container-lowest` background.

## 5. Navigation Design
*   **Desktop/Tablet (Landscape):** Persistent Material `NavigationDrawer` pinned to the left. Active states are highlighted using a stadium-shaped active indicator with the `secondary-container` color.
*   **Mobile/Tablet (Portrait):** The drawer becomes a `ModalNavigationDrawer` accessible via the TopAppBar hamburger icon. A `NavigationBar` (Bottom Nav) may be utilized for core features (Home, Appointments, Profile).

## 6. Component Library (M3 Core)
The frontend will strictly utilize Material Design 3 React components (e.g., via MUI v5/v6 with M3 theming enabled).
*   **Buttons:** `Filled` (Primary Actions), `Outlined` (Secondary Actions), `Text` (Tertiary Actions). All feature the M3 fully rounded pill shape.
*   **Inputs:** `Outlined` variant for higher contrast in medical settings.
*   **Cards:** `Elevated` for primary content blocks, `Filled` (using surface-container) for secondary groupings.
*   **Dialogs:** Used for critical confirmations (e.g., "Are you sure you want to log out?").

## 7. Color System
Based on Material Design 3 dynamic color theory, tailored for a trustworthy healthcare brand.
*   **Primary:** Deep Medical Blue (`#005ac1`). Conveys trust, cleanliness, and professionalism.
*   **Secondary:** Teal (`#006a60`). Used for active navigation states and success indicators.
*   **Tertiary:** Soft Indigo (`#535f70`). Used for subtle UI accents.
*   **Error:** Crimson Red (`#ba1a1a`). Used strictly for destructive actions and validation errors.
*   **Background:** `Surface` (`#fdfcff`) and `Surface-Container` (`#f3f4f9`) for soft contrast between the canvas and cards.

## 8. Typography System
Following the M3 Type Scale, utilizing the `Roboto` or `Inter` typeface for high legibility.
*   **Display / Headline:** Used sparingly for page titles (e.g., "Dashboard").
*   **Title Large (22px):** Used for Card headers and primary sections.
*   **Body Large (16px):** Primary reading text (user input, data rows).
*   **Body Medium (14px):** Secondary text, list descriptions.
*   **Label Large (14px, Medium Weight):** Button text, navigation links, and tabs.

## 9. Spacing System
Strict adherence to the 8pt grid system.
*   **Micro:** 4px, 8px (Internal component padding, e.g., icon to text).
*   **Standard:** 16px, 24px (Card padding, margins between related elements).
*   **Macro:** 32px, 48px, 64px (Section breaks, page margins).

## 10. Accessibility Guidelines (WCAG 2.1 AA)
*   **Contrast:** All text and critical UI elements must pass a minimum contrast ratio of 4.5:1 against their backgrounds.
*   **Focus States:** M3 focus rings must be visible on all interactive elements for keyboard navigation.
*   **Screen Readers:** All icon-only buttons (like the password visibility toggle) must include `aria-label` attributes.
*   **Forms:** All inputs must have visible labels; placeholder text is not a substitute for a label.

## 11. Responsive Design Rules
*   **Breakpoints:** 
    *   Mobile: `< 600px`
    *   Tablet: `600px - 904px`
    *   Desktop: `> 905px`
*   **Behavior:** Forms shift from multi-column grids to single-column vertical stacks on mobile. The persistent navigation drawer transforms into a modal drawer underneath the 905px breakpoint.
