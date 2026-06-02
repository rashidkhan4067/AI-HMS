# Frontend Architecture Methodology

## Architecture Style
The AI-HMS frontend strictly follows a **Feature-Based Architecture**. Instead of grouping files by their technical type (e.g., all components together, all hooks together), files are grouped by the business feature they belong to. This ensures high cohesion and makes the codebase highly scalable as new hospital modules are added.

## Folder Structure
At the root of the `src/` directory, the application is divided into core functional areas:

```
src/
├── app/          # Global application setup (store, router config, global styles)
├── features/     # Feature-specific modules (Auth, Patients, Doctors)
├── shared/       # Highly reusable UI components, layouts, and utilities
└── assets/       # Static assets (images, fonts, global CSS)
```

## Feature Structure
Each distinct business domain within `features/` encapsulates its own logic, UI, and services. A typical feature directory (e.g., `auth/`) looks like this:

```
features/
└── auth/
    ├── pages/       # Route-level components (e.g., LoginPage.jsx)
    ├── components/  # Feature-specific UI (e.g., LoginForm.jsx)
    ├── hooks/       # Custom React hooks specific to the feature
    ├── services/    # API calls and data fetching logic
    └── routes/      # Sub-routing definitions for the feature
```
*Future features will follow this exact pattern: `patients/`, `doctors/`, `appointments/`, etc.*

## State Management
*   **Local State:** Utilize `useState` and `useReducer` for state confined to a single component (e.g., form inputs, UI toggles).
*   **Shared State:** Utilize the **Context API** for lightweight global state that doesn't change rapidly (e.g., user session, theme preference).
*   **Future (If Needed):** **Redux Toolkit** will only be introduced if the state becomes highly complex, globally accessed, and rapidly changing (e.g., live clinical dashboards or complex multi-step wizards).

## API Layer
**Crucial Rule:** Never call APIs directly from pages or UI components.

*   **Delegation:** All external network requests must reside in the `services/` directory (e.g., `features/auth/services/authApi.js`).
*   **Data Flow:** Components trigger custom hooks, which in turn call the API service.

**Example Flow:**
`Page` ➔ `Hook` (e.g., `useLogin`) ➔ `Service` (e.g., `loginApi()`) ➔ `API`

## Routing Strategy
Routing is handled centrally but strictly categorized by access level.
*   **Public Routes:** Accessible to unauthenticated users (e.g., `/login`).
*   **Protected Routes:** Requires a valid JWT (e.g., `/dashboard`, `/profile`).
*   **Role-Based Routes:** Restricted to specific JWT claims:
    *   `/admin`
    *   `/doctor`
    *   `/receptionist`

## UI Methodology
*   **Design System:** Google Material Design 3 (M3).
*   **Component Library:** Material UI (MUI v5).
*   **Responsive Design:** Mobile-First approach. All layouts must gracefully scale from mobile devices up to ultra-wide desktop monitors.
*   **Accessibility:** Strict adherence to WCAG principles (keyboard navigation, high contrast, ARIA labels).

## Future Scalability
This architectural pattern is chosen specifically so the system can infinitely scale to support the entire AI-HMS roadmap without requiring a major structural rewrite. The architecture natively supports the isolated addition of:
*   Patient Management
*   Doctor Management
*   Appointment Management
*   Medical Records
*   AI Assistant
*   Reporting System
