# Frontend & Backend Code Architecture: Milestone 1

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Frontend Developers, Core Platform Engineers
- **Status:** APPROVED
---

## 1. Frontend Structure Layout (React SPA)

The frontend project utilizes a **Feature-Based Architecture (FBA)** pattern, segregating views and business logics into isolated domains.

```
frontend/src/
├── app/
│   ├── App.css
│   ├── App.jsx              # Root component wrapping routes and context providers.
│   ├── navigation.jsx       # Side drawer layout navigation mappings.
│   ├── routes.jsx           # Decoupled high-level routing mapping definitions.
│   └── theme/               # Material Design 3 tokens & MUI overrides.
│       ├── index.js
│       ├── palette.js
│       ├── spacing.js
│       └── typography.js    # Outfit font scaling rules.
├── features/
│   └── auth/                # Isolated Authentication Feature domain.
│       ├── components/
│       │   ├── ChangePassword.jsx  # Card with old/new/confirm fields.
│       │   ├── LoginForm.jsx       # Card containing username/pass inputs.
│       │   ├── ProfileForm.jsx
│       │   ├── ProtectedRoute.jsx  # Router guard checks.
│       │   └── RegisterForm.jsx    # Signup form for Patient accounts.
│       ├── context/
│       │   └── AuthContext.jsx     # NEW: Global session context provider.
│       ├── hooks/
│       │   └── useAuth.js          # Hook wrapper consuming AuthContext.
│       ├── pages/
│       │   ├── ForbiddenPage.jsx   # NEW: Plished 403 denied layout.
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── RegisterPage.jsx
│       ├── routes/
│       │   └── index.jsx           # Feature-level endpoint routings.
│       └── services/
│           └── authApi.js          # Axios payload client mappings.
├── shared/                  # Common resources consumed by multiple features.
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AuthLayout.jsx
│   │   │   └── DashboardLayout.jsx # Master frame containing header & nav drawer.
│   │   └── ui/
│   │       ├── BrandLogo.jsx
│   │       ├── FormCard.jsx
│   │       ├── LoadingButton.jsx
│   │       ├── PageHeader.jsx
│   │       ├── PasswordField.jsx
│   │       ├── RoleChip.jsx
│   │       └── index.js
│   └── services/
│       └── axios.js                # Shared HTTP instance with auto-refresh queue.
├── main.jsx                 # Entrypoint loading App.jsx and Outfit CSS weights.
└── index.css                # Global canvas settings (e.g., #root width overrides).
```

---

## 2. Backend Structure Layout (Django API)

The backend exposes RESTful services, using a modular Django application structure.

```
backend/
├── accounts/                # User accounts & authorization operations module.
│   ├── migrations/
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py            # CustomUser entity and UserManager settings.
│   ├── permissions.py       # NEW: DRF IsAdminUser / IsDoctorUser permission checks.
│   ├── serializers.py       # Payload formatting and signup constraints validators.
│   ├── tests.py             # NEW: Model and API route endpoint integration tests.
│   ├── urls.py              # Endpoint mappings (/register/, /login/, /me/, etc.).
│   └── views.py             # View controllers handling JWT operations.
├── core/                    # Core project configurations.
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py          # Secure configurations loading .env.
│   ├── urls.py              # Central routing mapping.
│   └── wsgi.py
├── manage.py                # Command-line administrative gateway utility.
└── requirements.txt         # Dependencies checklist (includes python-dotenv).
```
---
*End of Milestone 1 Structural Layout.*
