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
│   ├── routes.jsx           # High-level routing mappings.
│   └── theme/               # Material Design 3 tokens & MUI overrides.
│       ├── ThemeModeContext.jsx # Theme Mode Context (Dark / Light switcher).
│       ├── index.js         # Theme generator configuration.
│       ├── palette.js       # Color palette settings.
│       ├── spacing.js       # Layout grid settings.
│       └── typography.js    # Font scaling rules.
├── components/              # Global route protectors.
│   ├── GuestRoute.jsx       # Protects paths from authenticated users.
│   ├── ProtectedRoute.jsx   # Enforces role restrictions.
│   └── Unauthorized.jsx     # Unauthorized access fallback.
├── features/
│   └── auth/                # Isolated Authentication Feature domain.
│       ├── components/
│       │   ├── BlockedRegisterView.jsx     # Direct signup warning block.
│       │   ├── ChangePassword.jsx          # Old/new/confirm fields form.
│       │   ├── DoctorApplicationForm.jsx   # Multi-step PMDC/CNIC application.
│       │   ├── LoginForm.jsx               # Login input form.
│       │   ├── OtpInputGroup.jsx           # OTP numeric input slots.
│       │   ├── PasswordStrengthMeter.jsx   # Live password strength indicator.
│       │   ├── ProfileForm.jsx             # Google SSO onboarding details form.
│       │   ├── ProtectedRoute.jsx          # Feature wrapper for protected paths.
│       │   ├── RegisterForm.jsx            # Multi-step Patient registration form.
│       │   └── StepProgressBar.jsx         # Stepper indicators.
│       ├── constants/
│       │   └── roles.js                    # Front-end role labels.
│       ├── context/
│       │   └── AuthContext.jsx             # Global session state provider.
│       ├── hooks/
│       │   ├── useAuth.js                  # Hook consuming AuthContext.
│       │   └── useOtpTimer.js              # Hook managing OTP cooldowns.
│       ├── pages/
│       │   ├── CompleteProfilePage.jsx     # SSO profile completion prompt page.
│       │   ├── ForbiddenPage.jsx           # 403 denied screen.
│       │   ├── ForgotPasswordPage.jsx      # Recover request page.
│       │   ├── LockedPage.jsx              # Rate limit lockout screen.
│       │   ├── LoginPage.jsx               # Authenticate portal.
│       │   ├── NotFoundPage.jsx            # 404 screen.
│       │   ├── PrivacyPage.jsx             # Policy details page.
│       │   ├── ProfilePage.jsx             # User profile page.
│       │   ├── RegisterPage.jsx            # Patient register gateway page.
│       │   ├── ResetPasswordPage.jsx       # Reset password page.
│       │   ├── TermsPage.jsx               # Terms of service page.
│       │   └── VerifyOtpPage.jsx           # Enter 6-digit code page.
│       ├── routes/
│       │   └── index.jsx                   # Feature-level routing arrays.
│       ├── schemas/
│       │   └── authSchemas.js              # Zod validation models.
│       └── services/
│           └── authApi.js                  # Axios payload client mappings.
├── pages/
│   └── LandingPage.jsx      # High-performance clinical portal landing page.
├── shared/                  # Common resources consumed by multiple features.
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AuthLayout.jsx      # Split panel layout (left stats, right forms).
│   │   │   └── DashboardLayout.jsx # Master dashboard frame with header & side nav.
│   │   └── ui/
│   │       ├── BrandLogo.jsx       # SVG logo markup.
│   │       ├── CookieConsent.jsx   # Analytical/essential cookies manager banner.
│   │       ├── FormCard.jsx        # Rounded card container.
│   │       ├── GlobalLoader.jsx    # Double-pulse heartbeat loading overlay.
│   │       ├── LoadingButton.jsx   # Spinner buttons.
│   │       ├── PageHeader.jsx      # Document display headings.
│   │       ├── PasswordField.jsx   # Custom secure input.
│   │       ├── RoleChip.jsx        # Colored label indicator.
│   │       └── index.js            # Entry exports.
│   └── services/
│       └── axios.js                # HTTP instance with auto-refresh queue.
├── main.jsx                 # SPA loader.
└── index.css                # CSS weights and configs.
```

---

## 2. Backend Structure Layout (Django API)

The backend exposes RESTful services, using a modular Django application structure.

```
backend/
├── accounts/                # User accounts & authorization operations module.
│   ├── migrations/
│   ├── templates/           # Email templates.
│   ├── admin.py             # Custom Django Admin registrations.
│   ├── apps.py              # App configs.
│   ├── models.py            # Department, HMSUser, PasswordResetOTP, StaffInvite, DoctorApplication models.
│   ├── permissions.py       # DRF role-based permission classes.
│   ├── serializers.py       # DRF serializers (Google SSO, OTP, Register, Application serializers).
│   ├── tests/               # Model and API route integration tests.
│   │   └── test_auth.py
│   ├── urls.py              # Endpoint mappings (/register-patient/, /login/, /forgot-password/, /google/).
│   ├── utils.py             # SMTP email utilities.
│   └── views.py             # View controllers (Google login, OTP verification, lockouts, audits).
├── core/                    # Core project configurations.
│   ├── settings.py          # DRF configs and security environment variables.
│   ├── urls.py              # Root router (exposes /api/v1/auth/ and /api/auth/).
│   └── wsgi.py
├── manage.py                # Django CLI tool.
└── requirements.txt         # Dependencies manifest.
```
---
*End of Milestone 1 Structural Layout.*
