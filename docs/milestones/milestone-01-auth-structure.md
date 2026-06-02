# Frontend Folder Structure: Authentication Module

This document defines the strict directory structure for the Authentication module (Milestone 1) as implemented in the AI-HMS frontend. It adheres to the approved Feature-Based Architecture.

---

## 1. `app/` Directory

*   **Purpose:** The entry point and global configurator for the React application.
*   **Responsibility:** Initializing the root DOM, wrapping the application in global providers (Theme, Router, Context), and defining the high-level routing map.
*   **Allowed Contents:** 
    *   `App.jsx` (Root component)
    *   `routes.jsx` (Global route definitions)
    *   `theme.js` (Material Design 3 configuration)
    *   Global state store initializations (e.g., Redux store setup, if added later).

## 2. `features/auth/` Directory

*   **Purpose:** The isolated domain encapsulating everything related to user identity, login, registration, and profile management.
*   **Responsibility:** Handling all business logic, UI, and network requests required to authenticate a user and establish their role within the system.
*   **Allowed Contents:** Strictly subdivided into the following folders:
    *   **`pages/`**: Route-level containers (e.g., `LoginPage.jsx`, `RegisterPage.jsx`, `ProfilePage.jsx`). These compose components together but contain no complex logic.
    *   **`components/`**: Auth-specific UI elements (e.g., `LoginForm.jsx`, `ChangePassword.jsx`, `ProtectedRoute.jsx`).
    *   **`hooks/`**: Custom React hooks abstracting business logic (e.g., `useAuth.js`).
    *   **`services/`**: The dedicated API delegation layer (e.g., `authApi.js`). No UI code is allowed here.

## 3. `shared/` Directory

*   **Purpose:** A global repository for highly reusable code that spans across multiple different features.
*   **Responsibility:** Preventing code duplication by providing centralized utilities, UI components, and layouts that the entire application can consume.
*   **Allowed Contents:**
    *   **`components/layout/`**: Structural wrappers (e.g., `AuthLayout.jsx`, `DashboardLayout.jsx`).
    *   **`components/ui/`**: Generic, dumb UI elements (e.g., custom styled M3 buttons or loading spinners).
    *   **`services/`**: Global network configurations (e.g., `axios.js` interceptor).

## 4. `theme/` Directory *(Virtual/Logical Grouping)*

*   **Purpose:** To define the visual language of the application.
*   **Responsibility:** Enforcing the Material Design 3 guidelines (Colors, Typography, Spacing, Component Overrides).
*   **Allowed Contents:** Currently consolidated within `app/theme.js`. As the application scales, if multiple themes (Dark Mode, High Contrast) or complex overrides are needed, this will expand into a dedicated `src/theme/` directory containing palette and typography sub-files.

## 5. `assets/` Directory

*   **Purpose:** Storage for static, non-compiled resources.
*   **Responsibility:** Providing static media and global stylesheets required by the application before runtime.
*   **Allowed Contents:**
    *   Images (e.g., Hospital Logos, placeholder avatars).
    *   Global CSS resets (e.g., `index.css`).
    *   Custom local fonts (if not utilizing `@fontsource` packages).
