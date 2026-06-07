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

### 🟢 Milestone 1: Authentication & Authorization (Completed)
- **Deliverables:**
  - Custom user model with UUID keys, email indexing, and role-check constraints.
  - JWT token rotation and invalidation blacklists on logout.
  - Custom Django REST Framework RBAC permission classes.
  - Global `AuthContext` React state provider and consumed `useAuth` hook.
  - Queue-based Axios response interceptor for background token refreshing on 401s.
  - Public registration locked down to Patient role self-registration.
  - Typographic integration of `@fontsource/outfit` and responsive `#root` adjustments.
  - Automated testing running locally via SQLite database test fallbacks.
  - Automated CI configuration checking code building, linting, and tests.

---

### 📅 Milestone 2: Patient & Doctor Directory
- **Objective:** Provision databases and profile sheets for patient registry and clinician records.
- **Tasks:**
  - Create the `patient_profile` model, automated MRN (Medical Record Number) generator.
  - Create the `doctor_profile` model with specialty fields and availability toggles.
  - Implement RESTful CRUD views for Patient and Doctor directories.
  - Build frontend dashboards for clinical staff (`DOCTOR`, `RECEPTIONIST`, `ADMIN`) to lookup profiles.
  - Implement partial-matching search endpoints on name and MRN records.

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
