# React Component Development Standards

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Framework Target:** React 19 / JSX
- **Status:** APPROVED
---

## 1. Component Classifications

To ensure codebase scale and separate design concerns, components are classified into three distinct tiers:

### 1.1 UI Primitives (Shared)
- **Role:** Generic visual elements that are agnostic of business logic and domain context.
- **Attributes:** Presentational only, fully stateless, controlled via props.
- **Location:** [`src/shared/components/ui/`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/shared/components/ui/)
- **Examples:** `BrandLogo.jsx`, `FormCard.jsx`, `LoadingButton.jsx`, `RoleChip.jsx`.

### 1.2 Feature Modules (Isolated)
- **Role:** Components bound to specific business features or domain logic.
- **Attributes:** Compose UI primitives, consume custom hooks, manage local or global state.
- **Location:** [`src/features/<feature_name>/components/`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/features/)
- **Examples:** `LoginForm.jsx`, `RegisterForm.jsx`, `ChangePassword.jsx`.

### 1.3 Layout Scaffolding (Shared)
- **Role:** Structural wrappers managing routing outlets and page boundaries.
- **Location:** [`src/shared/components/layout/`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/shared/components/layout/)
- **Examples:** `DashboardLayout.jsx`, `AuthLayout.jsx`.

---

## 2. Component Design Requirements

- **Separation of Concerns:** Component bodies must not contain raw API queries. Network interactions must be delegated to dedicated hook wrappers (e.g., `useAuth.js`) or API service providers.
- **Deterministic Rendering:** Components should return predictable nodes based on incoming props.
- **Prop Checking:** Props passed to shared components should be clearly structured and validated (using JavaScript destructuring defaults or TypeScript interfaces).

---

## 3. Metrics & Refactoring Rules

To prevent code bloat and maintain readable modules:
- **Line Count Rules:**
  - **Preferred:** 50 to 200 lines.
  - **Review Indicator:** $\ge$ 300 lines (Consider splitting presentational layout).
  - **Refactor Mandatory:** $\ge$ 500 lines (Requires splitting into smaller child components).
- **Promotion Rule:** If a feature-scoped component is required by a secondary feature, it must be promoted to the shared library ([`src/shared/components/ui/`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/shared/components/ui/)) and cleaned of domain-specific hooks.
