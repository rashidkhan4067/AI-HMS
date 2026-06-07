# Frontend Software Architecture Specification

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Primary Framework:** React 19 / Vite 8
- **Design Tokens:** Material Design 3 (M3)
- **Status:** APPROVED
---

## 1. Feature-Based Architecture (FBA)

The frontend codebase uses a **Feature-Based Architecture (FBA)** pattern. Instead of grouping files by technical divisions (e.g., placing all hooks or controllers in single folders), files are encapsulated within isolated business domains (features). This creates high modular cohesion and reduces interface coupling.

```
frontend/src/
├── app/                  # Application initialization (routing maps, theme config).
├── features/             # Business domain modules (auth, patients, doctors).
├── shared/               # Reusable primitives, common layouts, and HTTP clients.
└── main.jsx              # Entry point loading App.jsx and Outfit CSS weights.
```

---

## 2. Feature Folder Design

Each domain in the `features/` directory must organize its internal files using a strict structural map:
- **`pages/`**: Route-level container views. Handles section composition only, keeping business checks decoupled.
- **`components/`**: Feature-scoped visual elements (e.g., form panels, custom buttons).
- **`hooks/`**: Custom React hooks encapsulating specific domain logic.
- **`services/`**: API payload operations (HTTP mapping services).
- **`routes/`**: Sub-routing definitions for the feature.

---

## 3. Global & Local State Guidelines

- **Local State (`useState` / `useReducer`):** Kept strictly local to individual components (e.g., input values, validation states, local modal indicators).
- **Shared / Domain State (React Context):** Managed via light React Context Providers for global parameters (e.g., `AuthContext.jsx` for user roles and JWT profiles).
- **State Flow Rule:** Components must never contain raw state mutation handlers calling external resources directly; they must consume hooks (`useAuth.js`) which hook into Context or service layers.

---

## 4. REST API Integration Protocol

Direct HTTP requests (using Axios or fetch) are forbidden inside React components.
- **Data Flow Pipeline:**
  ```
  Component (LoginForm) ➔ Hook (useAuth) ➔ API Client (authApi) ➔ Axios (axios.js)
  ```
- **Axios Instance Security:** All outgoing calls go through the shared `axios.js` client. It automatically injects Bearer JWT signatures and manages request queuing during automated token refreshes on HTTP 401 events.
- **Environment URLs:** Endpoint targets are resolved from `import.meta.env.VITE_API_URL` with a local fallback to `http://localhost:8000/api/v1/`.

---

## 5. Protected Routing and RBAC Gates

Route access is restricted on the client using the `ProtectedRoute` wrapper component:
- **Session Check:** Verifies if a JWT is present and unexpired. If missing or invalid, it redirects the client to `/login`.
- **Role Verification:** Decodes claims in the Access Token. If the user's role is not included in the route's `allowedRoles` list, the client is redirected to the `/forbidden` page.
