# Kanban Board: Task Tracking

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Status:** ACTIVE
- **Last Updated:** June 6, 2026
---

## 📝 Backlog (Future Milestones)
- Create Patient Django model and auto-generated MRN field (Milestone 3)
- Create Doctor Django model with specialty and availability fields (Milestone 3)
- Create Patient and Doctor list/detail serializers and viewsets (Milestone 3)
- Build frontend Patient and Doctor directory listing tables (Milestone 3)
- Build Appointment booking logic (Milestone 4)
- Implement Medical Records and Prescriptions (Milestone 5)
- AI patient history summarization (Milestone 6)
- Complete Admin dashboard backend integrations & security actions (Milestone 7)

---

## 📋 To Do (Milestone 2)
- Create `AdminLayout.jsx` with a collapsible sidebar and dynamic breadcrumb header.
- Implement notifications dropdown panel and user avatar menu in Admin header.
- Add `adminNavigation` configuration mapping in `navigation.jsx`.
- Mount admin layout and tab sub-routes in `routes.jsx`.
- Implement `AdminDashboardOverview.jsx` stub page with KPI layout grid mockups.
- Create stub pages and tables for `AdminInvitations`, `AdminApplications`, `AdminUsers`, and `AdminAudits`.

---

## 🏗️ In Progress
- (Empty)

---

## 🔍 Review
- (Empty)

---

## ✅ Done
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
