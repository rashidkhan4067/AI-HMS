# Design System

## Purpose
This document defines the overarching visual design language for the AI Hospital Management System (AI-HMS) to ensure a cohesive user experience across all modules.

## Design Philosophy
*   **Clean:** Minimal visual noise to reduce cognitive load.
*   **Professional:** Instills trust and reliability.
*   **Healthcare-focused:** High legibility, distinct status colors (e.g., critical vs normal).
*   **Accessible:** Strictly adheres to WCAG 2.1 AA standards.
*   **Material Design 3 (M3) Compliant:** Embraces dynamic shapes, elevation, and typography native to M3.

## Design Framework
**Google Material Design 3 (M3)** via MUI v5.

## Principles
*   **Consistency:** Predictable interactions and visual patterns.
*   **Accessibility:** Usable by everyone (keyboard navigation, high contrast).
*   **Simplicity:** Do not over-engineer the UI.
*   **Scalability:** The design must adapt natively as new complex clinical modules are added.
*   **Responsive Design:** Mobile-first fluid adaptation.

## Layout Grid
The layout system leverages a responsive grid based on screen width:
*   **Desktop:** 12-column grid
*   **Tablet:** 8-column grid
*   **Mobile:** 4-column grid

## Border Radius (Shapes)
M3 relies heavily on distinct border radii to communicate hierarchy and interactivity.
*   **Small:** `8px` (Inputs, Dropdowns, Chips)
*   **Medium:** `12px` (Small layout containers, Alerts)
*   **Large:** `16px` (Cards, Modals)
*   **Cards (Standard):** `16px`
*   **Dialogs / Modals:** `24px`

## Elevation (Shadows)
Use elevation sparingly. Shadows should communicate depth and Z-axis hierarchy, not decoration.
*   **Level 1:** Cards and contained content blocks.
*   **Level 2:** Dropdown menus, tooltips, and floating action buttons.
*   **Level 3:** Critical Dialogs, Modals, and persistent Nav Drawers.
*   *Rule:* Avoid excessive or custom shadows; stick to the predefined M3 elevation tokens.

## Spacing Scale
Strict adherence to the 4px baseline grid. **Use only spacing values from this scale:**
*   `4px`
*   `8px`
*   `12px`
*   `16px`
*   `24px`
*   `32px`
*   `48px`
*   `64px`

## Icon System
**Material Symbols** (Rounded/Outlined variants via `@mui/icons-material`).

**Usage Areas:**
*   **Navigation:** Nav Drawer items, Bottom Nav bars.
*   **Actions:** Icon buttons (e.g., Edit, Delete, Visibility Toggle).
*   **Status Indicators:** Success checks, Error warnings in clinical dashboards.

*Rule:* **Avoid mixing icon libraries** (do not introduce FontAwesome or Feather icons). Stick entirely to Material Symbols for consistency.
