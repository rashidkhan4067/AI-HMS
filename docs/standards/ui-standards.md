# UI Standards

## Purpose
This document outlines the strict UI component rules, typography scales, and responsive behaviors required for the AI Hospital Management System (AI-HMS). These standards bridge the gap between our Design System rules and the actual React implementation.

## Theme Strategy
**Architecture:** `ThemeProvider` via MUI v5.
*   **Light Theme:** Default for all users.
*   **Dark Theme:** Infrastructure must support future toggling. Hardcoded hex colors outside of the `theme.palette` object are strictly prohibited to ensure future dark mode support.

## Color System
Semantic mapping of the color palette:
*   **Primary:** Healthcare Blue (Main brand, primary actions)
*   **Secondary:** Teal (Accents, active navigation)
*   **Success:** Green (Operation successful, patient discharged)
*   **Warning:** Amber (Missing data, pending approvals)
*   **Error:** Red (Destructive actions, validation failures)
*   **Neutral:** Gray Scale (Text, borders, disabled states)

## Typography
**Font Family:**
*   **Primary:** `Roboto`
*   **Fallback:** `Arial, sans-serif`

### Typography Scale (M3 Defaults)
*   **Display Large:** `57px` (Hero banners, empty state headers)
*   **Headline Large:** `32px` (Page Titles)
*   **Title Large:** `22px` (Card Headers, Dialog Titles)
*   **Body Large:** `16px` (Primary reading text, standard inputs)
*   **Body Medium:** `14px` (Secondary text, table data)
*   **Label Medium:** `12px` (Overline text, micro-copy, timestamps)

### Font Weights
*   **Regular:** `400` (Body text)
*   **Medium:** `500` (Buttons, Tabs, Table Headers)
*   **SemiBold:** `600` (Sub-headers)
*   **Bold:** `700` (Critical callouts)

## Components

### Buttons
All buttons must be pill-shaped with a **Minimum Height of 40px** to ensure mobile touch-target accessibility.
*   **Primary Button:** `Filled` (MUI `variant="contained"`)
*   **Secondary Button:** `Outlined` (MUI `variant="outlined"`)
*   **Danger Button:** Uses Error Color (MUI `color="error"`)

### Forms
Every single form input across the application must contain:
1.  **Label** (Always visible, floating style acceptable).
2.  **Placeholder** (Example data).
3.  **Validation Message** (Feedback on submission or blur).
4.  **Error State** (Red outline and text when invalid).

### Tables
Data grids (e.g., Patient Lists, Appointment Logs) must implement the following requirements:
*   **Sorting:** Clickable column headers.
*   **Pagination:** Server-side pagination to handle thousands of medical records.
*   **Search:** Debounced global or column-specific text search.
*   **Responsive Layout:** Tables must horizontally scroll on mobile devices rather than crushing columns.

## Accessibility (a11y)
*   **Contrast Ratio:** Minimum `4.5:1` contrast ratio for all text and critical UI elements against their background.
*   **Keyboard Navigation:** Required. Users must be able to Tab through all interactive elements.
*   **Screen Reader Support:** Required. Use `aria-labels` on icon-only buttons.
*   **Visible Focus Indicators:** Required. Never use CSS `outline: none;` without providing an alternative focus ring.

## Responsive Breakpoints
Our mobile-first implementation targets the following exact breakpoints:
*   **Mobile:** `0 – 599px`
*   **Tablet:** `600 – 1023px`
*   **Desktop:** `1024px+`
*   **Large Desktop:** `1440px+`
