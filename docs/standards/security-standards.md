# Platform Security & Auditing Standards

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Security Operations, DevOps, Core Engineers
- **Compliance Alignment:** HIPAA Baseline Security Alignment
- **Status:** APPROVED
---

## Core System Security Philosophy

> **Al Shifaa HMS follows claim-based identity with server-side role resolution, zero trust request validation, RBAC permission enforcement, and controlled onboarding — users prove identity, the system determines access.**

### 1. Identity-Driven UI
There is one login page for everyone — doctor, receptionist, admin, nurse, pharmacist, patient. No dropdowns, no role selection, no separate URLs for different staff. Just email and password (or Google SSO). After authentication, the server-issued JWT token contains the role claim. The frontend reads it and renders the correct dashboard. The UI is fully identity-driven, avoiding client-side state manipulation or security claims.

### 2. Controlled Onboarding (Provisioning vs Self-Registration)
As an enterprise Hospital Management System, Al Shifaa HMS implements a provisioning-assisted flow rather than open self-registration. Clinical staff apply for accounts, and an administrator provisions/activates them with the appropriate role and department.

## 1. Authentication & Session Security

- **Password Cryptography:** All plaintext passwords must be securely hashed on the backend using Django's standard hashing algorithms (e.g., PBKDF2 with SHA-256 or bcrypt) prior to database execution. Plaintext passwords must never be logged or transmitted in response payloads.
- **Stateless JWT Lifespan:**
  - **Access Token:** Short-lived (15 minutes). Minimizes exposure windows.
  - **Refresh Token:** Long-lived (7 days). Allowed for access token regeneration.
- **Refresh Token Rotation (RTR):** SimpleJWT must rotate refresh tokens on every renewal. Used/old refresh tokens are immediately blacklisted on the database.
- **Blacklisting on Logout:** Calling the `/logout/` endpoint must immediately blacklist the associated refresh token, preventing any future session renewals.

---

## 2. Secrets Management & Environment Security

- **Zero Hardcoding Policy:** Secrets, including database connection strings, master keys, and token signing parameters, must never be hardcoded into the source code.
- **Fail-Safe Startup:** The application must immediately raise `django.core.exceptions.ImproperlyConfigured` and fail to start if critical environment secrets (`SECRET_KEY`, `DATABASE_URL`) are missing.
- **Environment Isolation:**
  - Production configurations must load keys directly from runtime environment injection.
  - Local development loads keys via `python-dotenv` from a local `.env` file (which is included in `.gitignore`).

---

## 3. Database Testing Isolation

To prevent leakages, accidental testing data pollution, and outbound connection dependency failures:
- **Test Mode Isolation:** When Django runs unit tests, the database settings must switch to an in-memory/file-based `sqlite3` setup. This prevents unit tests from connecting to the cloud PostgreSQL database, keeping test suites 100% sandboxed and offline.

---

## 4. CORS and Request Filtering

- **CORS Policies:** In production environments, Cross-Origin Resource Sharing (CORS) must be locked to specific, verified domain aliases:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "https://your-app.vercel.app",
  ]
  ```
- **Allowed Hosts:** Restrict `ALLOWED_HOSTS` to the designated server and API domain names to block HTTP Host header injection vulnerabilities.
- **HTTPS Enforcement:** Restrict all production routes to HTTPS. The server must automatically reject insecure HTTP queries.
