# Software Coding Standards & Style Guidelines

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Languages:** JavaScript/JSX, Python
- **Status:** APPROVED
---

## 1. Core Engineering Principles

To maintain modularity and high development velocity:
- **SOLID Design Principles:** Follow single-responsibility (SRP) and open-closed (OCP) principles. Every module, class, and component must focus on a single core duty.
- **DRY (Don't Repeat Yourself):** Extract duplicated functions, utilities, and styling tokens into shared modules (e.g., `src/shared/components/ui/` for React).
- **KISS (Keep It Simple, Stupid):** Avoid premature optimizations and overly complex abstractions. Code readability is prioritized over code cleverness.

---

## 2. Naming Conventions

### 2.1 Variables & Identifiers

| Language | Scope | Format | Good Example | Bad Example |
|:---|:---|:---:|:---|:---|
| **Python** | Local, functions, fields | `snake_case` | `user_profile`, `get_token` | `userProfile`, `getToken` |
| **JavaScript** | Local, functions, fields | `camelCase` | `userProfile`, `getToken` | `user_profile`, `get_token` |
| **Both** | Classes, models, components | `PascalCase`| `CustomUser`, `LoginForm` | `custom_user`, `loginForm` |
| **Both** | Constants, configuration keys| `UPPER_SNAKE` | `ACCESS_TOKEN_LIFETIME` | `accessTokenLife` |

### 2.2 React JSX Specifics
- **Component Files:** Must use `PascalCase` with `.jsx` file extension (e.g., `ProtectedRoute.jsx`).
- **Hook Files:** Must use `camelCase` prefixed with `use` (e.g., `useAuth.js`).
- **Styles & Theme Overrides:** Rely on Material Design 3 theme custom styling tokens. Avoid custom CSS styling injections when theme variables exist.

---

## 3. Inline Comments & Self-Documenting Code

- **Intent Over Content:** Comments should explain *why* something is done (context, business rules, edge cases), not *what* the code does. The code structure itself must convey the *what*.
  - **Good:** `// Auto-refresh token request queue locked to prevent recursion`
  - **Bad:** `// Sets isRefreshing flag to true`
- **Docstrings (Python):** All views, serializers, models, and helper utils must have clear, single-line or multi-line docstrings detailing arguments and return types.

---

## 4. Git Version Control Conventions

We enforce the **Conventional Commits** specification to build readable project changelogs:

```
<type>(<scope>): <short description>
```

### 4.1 Allowed Types
- `feat`: A new feature implementation (e.g., `feat(auth): add Axios automatic token refresh`).
- `fix`: A bug resolution (e.g., `fix(settings): remove database credentials leak`).
- `refactor`: Restructuring code without altering functional behaviors (e.g., `refactor(auth): consume AuthContext in useAuth`).
- `docs`: Modifying documentation files (e.g., `docs(standards): update code style docs`).
- `test`: Adding or updating unit/integration tests (e.g., `test(accounts): write model tests for CustomUser`).
