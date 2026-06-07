# Kanban Board: Task Tracking

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Status:** ACTIVE
- **Last Updated:** June 6, 2026
---

## 📝 Backlog (Future Milestones)
- Implement core Patient CRUD APIs (Milestone 2)
- Implement Doctor directory and profiles (Milestone 2)
- Build Appointment booking logic (Milestone 3)
- Implement Medical Records and Prescriptions (Milestone 4)
- AI patient history summarization (Milestone 5)
- Admin dashboard and reporting (Milestone 6)

---

## 📋 To Do (Milestone 2)
- Create Patient Django model and auto-generated MRN field.
- Create Doctor Django model with specialty and availability fields.
- Create Patient and Doctor list/detail serializers and viewsets.
- Build frontend Patient and Doctor directory listing tables.
- Add partial-matching search logic on name and MRN records.

---

## 🏗️ In Progress
- (Empty)

---

## 🔍 Review
- (Empty)

---

## ✅ Done
- Setup GitHub Actions CI pipeline with automated building, linting, and tests.
- Define project milestones and create baseline documentation folders.
- Initialize React frontend with Vite and Material Design 3.
- Initialize Django REST framework backend with PostgreSQL (Neon) configurations.
- Create accounts Django application and implement `CustomUser` model.
- Setup JWT authentication endpoints (`/register/`, `/login/`, `/refresh/`, `/logout/`, `/me/`).
- Create global `AuthContext` state provider and `useAuth` hook wrapper.
- Integrate automatic Axios token refresh response queue interceptor.
- Setup SQLite database configurations for local test suites.
- Restrict public user signup role self-selection to `PATIENT` only.
- Build modern `LoginPage` and `RegisterPage` UI forms.
- Create `ForbiddenPage` component and update `ProtectedRoute` redirection targets.
- Implement comprehensive backend unit testing suite in `tests.py`.
