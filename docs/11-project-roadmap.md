# Project Roadmap: Multi-Phase Milestones

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Project Managers, Developers, Client Stakeholders
- **Status:** APPROVED
---

## 1. Executive Timeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Planning & Setup  |  Phase 2: Authentication (M1 Completed)   │
│  [2026-06-01 to 2026-06-05] |  [2026-06-05 to 2026-06-06]               │
└────────────────────────────────────────────────────┬────────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Phase 3: Actor Directories (M2)  |  Phase 4: Scheduling & EHR (M3/M4)  │
│  [2026-06-07 to 2026-06-15]       |  [2026-06-16 to 2026-06-30]         │
└────────────────────────────────────────────────────┬────────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Phase 5: AI & RAG Capabilities (M5) | Phase 6: Audits & Deployment (M6)│
│  [2026-07-01 to 2026-07-15]          | [2026-07-16 to 2026-07-30]       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Milestone Details

### 🟢 Milestone 0: Public Landing Page & Design System (Completed)
- **Deliverables:**
  - Responsive landing page routing page (`LandingPage.jsx`) displaying brand assets.
  - Public marketing modules including `Navbar`, `HeroSection`, `StatsBar`, `FeaturesSection`, `HowItWorksSection`, `ForPatientsSection`, `ForHospitalsSection`, `TestimonialsSection`, `CtaSection`, and `Footer`.
  - Accessible Cookie Consent Manager component (`CookieConsent.jsx`) with analytical preferences toggling.
  - Global heartbeat loading overlay transition (`GlobalLoader.jsx`) for clinical workspace loading visual feedback.
  - Base design system colors, border-radius presets, and layout grids in MUI v9 configurations.

---

### 🟢 Milestone 1: Authentication & Authorization (Completed)
- **Deliverables:**
  - Custom user model with UUID keys, email indexing, and role-check constraints (`HMSUser`).
  - JWT token rotation and invalidation blacklists on logout.
  - Google OAuth SSO integration & Profile Completion (linking `google_sub` for authenticated SSO users).
  - OTP-based Password Reset flow (6-digit verification code generation, expiration validation, and email dispatch).
  - Multi-step Patient registration form with client validation.
  - Doctor onboarding application form with CNIC/PMDC license document file uploads.
  - Custom Django REST Framework RBAC permission classes (`IsAdminUser`, `IsDoctorUser`, etc.).
  - Global `AuthContext` React state provider and consumed `useAuth` hook.
  - Queue-based Axios response interceptor for background token refreshing on 401s.
  - Public registration locked down to Patient role self-registration (staff registration restricted to administrator invites).
  - Responsive split-panel Auth layout with dynamic `BrandPanel` variants.
  - Theme mode context provider supporting dark/light options.
  - Slide-up Cookie Consent banner and global heartbeat loading overlays.
  - Automated testing running locally via SQLite database test fallbacks.
  - Automated CI configuration checking code building, linting, and tests.

---

### 📅 Milestone 2: Professional Admin Layout & Workspace Routing
- **Objective:** Design and implement a premium, high-fidelity workspace shell for the Admin portal, featuring collapsible sidebar layouts, notification centers, dynamic headers, and sub-routing transitions.
- **Tasks:**
  - Build a collapsible left sidebar navigation (using MUI `Drawer`) with custom active/inactive styling.
  - Integrate a top bar (`AppBar`) featuring a collapsible trigger icon, breadcrumbs, and user avatar menu.
  - Implement a system notifications center dropdown menu listing security and onboarding events.
  - Register `/admin/dashboard`, `/admin/invites`, `/admin/applications`, `/admin/users`, and `/admin/audits` sub-routes.
  - Create high-fidelity visual stubs and cards for each of the five admin workspace tabs.

---

### 📅 Milestone 3: Operational Scheduling
- **Objective:** Implement calendars and appointment booking workflows.
- **Tasks:**
  - Implement appointment slot models with status flags (`PENDING`, `CONFIRMED`, `CANCELLED`).
  - Create slot booking APIs checking doctor availability, preventing double-bookings.
  - Build interactive calendar dashboard views on the frontend for doctor/receptionist portals.
  - Implement appointment request workflows for Patient users.

---

### 📅 Milestone 4: EHR & Prescriptions
- **Objective:** Digitize medical history logs and clinical prescriptions.
- **Tasks:**
  - Create models for medical records, diagnostic observations, and prescriptions.
  - Build REST APIs restricted strictly to `DOCTOR` users for writing EHRs and prescriptions.
  - Implement patient-only read restrictions to view their own records.
  - Integrate PDF generation services for printing secure, official prescription sheets.

---

### 📅 Milestone 5: RAG & Clinical AI Features
- **Objective:** Inject large language model assistance capabilities.
- **Tasks:**
  - Select LLM vendor service (OpenAI, Anthropic, or local model).
  - Build Retrieval-Augmented Generation (RAG) endpoints to securely index patient history.
  - Build "EHR Summarization" buttons on doctor patient logs to synthesize clinical summaries.
  - Implement an interactive clinical chatbot for internal staff queries.

---

### 📅 Milestone 6: Quality, Security & Deployment
- **Objective:** Audit compliance, perform UAT, and deploy services.
- **Tasks:**
  - Conduct full HIPAA compliance scans on data logging and storage levels.
  - Run exhaustive frontend/backend integration and security penetration test suites.
  - Build Docker containers for Django REST backend and PostgreSQL database.
  - Deploy frontend to Vercel/Netlify and backend services to Render/AWS EC2.
