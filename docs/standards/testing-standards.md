# Quality Assurance & Testing Standards

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Software Development Engineers in Test (SDET), QA Leads, Developers
- **Status:** APPROVED
---

## 1. Backend Verification Standards (Django)

- **Test Suite Structure:** Every Django app must contain a `tests.py` file or a `tests/` directory with test files named `test_*.py`.
- **Base Classes:**
  - Database and model-level assertions must extend Django's `TestCase`.
  - API endpoint controllers and serializers validation must extend Django REST Framework's `APITestCase`.
- **Core Assertions:**
  - **Unauthorized Coverage:** Verify that protected endpoints reject anonymous request payloads with `401 Unauthorized` or `403 Forbidden` response codes.
  - **Payload Validation:** Verify that invalid request parameters return `400 Bad Request` containing specific field-level validation errors.
  - **Successful Operations:** Verify that valid requests return `200 OK` or `201 Created` with correct JSON schemas.
- **Database Sandboxing:**
  - Django unit tests must run against a local SQLite in-memory or file-based database (`db.sqlite3`). Outbound cloud connections (such as Neon PostgreSQL) are forbidden to ensure offline, decoupled execution.

---

## 2. Frontend Verification Standards (React)

- **Component Testing:** UI components (e.g., forms, dialogs) must be verified to render properly under different state inputs.
- **Dependency Isolation:** External HTTP requests (Axios) and hooks (like `useAuth`) must be mocked during testing to prevent state leaks.
- **Build Checks:** The application must compile successfully (`npm run build`) and pass styling rules (`npm run lint`) prior to version control commits.

---

## 3. CI/CD Integration & Automation

All code merges to key branches (such as `main` and `master`) must run through the automated pipeline configured in [`.github/workflows/ci.yml`](file:///e:/Download/solid%20project/AI-HMS/.github/workflows/ci.yml):

- **Backend Phase:** Installs dependencies and runs `python manage.py test`. Any failing test aborts the build.
- **Frontend Phase:** Installs packages, runs `npm run lint` for code styling checks, and compiles the bundle via `npm run build` to verify production readiness.
