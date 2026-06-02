# Component Standards

## Purpose
This document defines the frontend component architecture and reuse strategy for the AI Hospital Management System (AI-HMS). By following these standards, we ensure a scalable, predictable, and highly maintainable React codebase.

## Design Principles
* **Reusable:** Components should be designed to be used in multiple contexts where appropriate.
* **Maintainable:** Code should be easy to read, update, and debug.
* **Testable:** Components should be isolated and easy to unit test.
* **Single Responsibility:** A component should do one thing. If it does too much, break it down into smaller sub-components.

## Component Categories

### 1. UI Components
Reusable, generic visual elements that are completely agnostic of business logic.
* **Examples:** `Button`, `Input`, `Modal`, `Card`
* **Location:** `frontend/src/shared/components/ui/`

### 2. Feature Components
Components that are specific to a distinct business feature or domain.
* **Examples:** `LoginForm`, `PatientTable`, `AppointmentCalendar`
* **Location:** `frontend/src/features/<feature>/components/`

### 3. Layout Components
Structural components used to wrap pages or major sections.
* **Examples:** `DashboardLayout`, `AuthLayout`, `MainLayout`
* **Location:** `frontend/src/shared/layouts/`

## Component Structure
Each component should strictly adhere to the following structural rules:
*   Contain presentation logic (how things look).
*   Contain minimal business logic. Complex state or logic should be handled by custom hooks or state managers (e.g., Redux, Context).
*   Accept reusable props to ensure maximum flexibility.

**Avoid:**
*   **API calls directly inside UI components.** API logic belongs in services or custom hooks.
*   **Large monolithic components.** Break down UI into smaller chunks.

## Component Size Rule
To maintain readability and reduce cognitive load, strictly monitor component size:
*   **Preferred:** `50 - 200 lines`
*   **Review if:** `300+ lines` (Consider if it can be broken down).
*   **Refactor if:** `500+ lines` (Mandatory refactor into smaller child components).

## Reusability Rule
If a component located within a `features/` directory is eventually required by a different module/feature, it must be promoted to the shared library:
*   **Action:** Move to `frontend/src/shared/components/` to prevent duplication.
