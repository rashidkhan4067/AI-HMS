# Kanban Board: Task Tracking

---
**Metadata**
- **Document Version:** 1.1 (Milestone 2 Completed)
- **Status:** ACTIVE
- **Last Updated:** June 12, 2026
---

## 📝 Backlog (Future Milestones)
- Build Appointment booking logic (Milestone 3 scheduling)
- Implement Medical Records and Prescriptions (Milestone 4 EHR)
- AI patient history summarization (Milestone 5 AI)
- Complete Admin dashboard backend integrations & security actions (Milestone 6)

---

## 📋 To Do (Milestone 3: Scheduling & Directories)
- Create Patient Django model and auto-generated MRN field.
- Create Doctor Django model with specialty and availability fields.
- Create Patient and Doctor list/detail serializers and viewsets.
- Build frontend Patient and Doctor directory listing tables.
- Build interactive appointment booking and doctor slot availability calendars.

---

## 🏗️ In Progress
- (Empty)

---

## 🔍 Review
- (Empty)

---

## ✅ Done
- Create `AdminLayout.jsx` with a collapsible sidebar and dynamic breadcrumb header.
- Implement notifications dropdown panel and user avatar menu in Admin header.
- Add `adminNavigation` configuration mapping in `navigation.jsx`.
- Mount admin layout and tab sub-routes in `routes.jsx`.
- Implement `AdminDashboardOverview.jsx` stub page with KPI layout grid mockups.
- Create stubs and listing feeds for `AdminInvitations`, `AdminApplications`, `AdminUsers`, and `AdminAudits`.
- Extract and modularize admin dialog components into `src/features/admin/dialogs/` to clean up view files.
- Redesign Profile page, Edit Profile form, and Change Password component into Google Account style.
- Set up background asynchronous email delivery engine with auto-retry and banner redirects.
- Scaffolded public Landing Page layout sections (`Navbar`, `HeroSection`, `StatsBar`, `FeaturesSection`, etc.).
- Integrated slide-up `CookieConsent` analytic cookie preferences toggling banner.
- Created `GlobalLoader` double-pulse heartbeat animation overlay.
- Defined Material Design 3 spacing tokens, teals palette, and `DM Sans` typographic scales.
- Setup GitHub Actions CI pipeline with automated building, linting, and tests.
- Define project milestones and create baseline documentation folders.
- Initialize React frontend with Vite and Material Design 3.
- Initialize Django REST framework backend with PostgreSQL (Neon) configurations.
- Create accounts Django application and implement `CustomUser` model.
- Setup JWT authentication endpoints (`/register/`, `/login/`, `/refresh/`, `/logout/`, `/me/`).
- Integrated Google SSO authentication endpoints and accounts profile linking.
- Built forgot password recovery flow via OTP verification codes and automated emails.
- Created administrator staff invitation token verification and role constraint guards.
- Built multi-step Patient registration form with client-side field validation.
- Created multi-step Doctor onboarding application form with CNIC/PMDC proof uploads.
- Create global `AuthContext` state provider and `useAuth` hook wrapper.
- Integrate automatic Axios token refresh response queue interceptor.
- Setup SQLite database configurations for local test suites.
- Restrict public user signup role self-selection to `PATIENT` only.
- Build modern `LoginPage` and `RegisterPage` UI forms.
- Create `ForbiddenPage` component and update `ProtectedRoute` redirection targets.
- Integrated theme mode context supporting light and dark switching globally.
- Built slide-up Cookie Consent analytics cookie preference manager.
- Created Global Loader animation utilizing rotating rings and a heartbeat pulsing logo.
- Implement comprehensive backend unit testing suite in `tests.py`.
