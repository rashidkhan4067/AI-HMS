# Software Requirements Specification (SRS): Authentication & Authorization

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Frontend Engineers, Backend Engineers, QA Teams
- **Status:** APPROVED
---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the Authentication and Authorization module of the Al Shifaa HMS. This module acts as the core gateway for system security, ensuring that clinical, administrative, and patient resources are protected and restricted according to role-based privileges.

### 1.2 Scope
The scope of this document is limited to the Milestone 1 release, which covers custom user model schema validation, JWT-based stateless sessions, automated client-side token renewal, custom API route permission checking, password update workflows, and security remediation policies.

---

## 2. Functional Requirements

### 2.1 Identity & User Registration (FR-REG)
- **FR-REG-1 (Registration Limits):** The system shall expose a public registration endpoint. This endpoint must strictly allow registration with the role `PATIENT`. All other administrative (`ADMIN`) or clinical (`DOCTOR`, `RECEPTIONIST`) accounts must be blocked from public registration.
- **FR-REG-2 (Input Validation):** The registration service must validate:
  - Unique, non-empty email addresses (case-insensitive normalized to lowercase).
  - Passwords meeting complexity standards (minimum 8 characters).
  - Full name field (non-empty, alphanumeric, maximum 150 characters).
- **FR-REG-3 (Password Hashing):** Passwords must be hashed using Django's default secure cryptographic algorithm (PBKDF2 with SHA-256 / bcrypt) before database storage. Plaintext passwords must never be stored, logged, or sent in API responses.

### 2.2 User Authentication & JWT Operations (FR-AUTH)
- **FR-AUTH-1 (Credentials Check):** The login service shall authenticate users using email and password.
- **FR-AUTH-2 (Token Pair Issuance):** Successful authentication must return a JWT pair:
  - **Access Token:** Short-lived token containing role, email, and user ID claims (15-minute lifespan).
  - **Refresh Token:** Long-lived token used to generate new access tokens (7-day lifespan).
- **FR-AUTH-3 (Custom Response Payload):** The login endpoint JSON response body must return `access`, `refresh`, `role`, and `email`.
- **FR-AUTH-4 (Blacklist on Logout):** The logout endpoint must accept the `refresh` token, blacklist it in the server database (preventing any future token generation), and instruct the frontend client to clear all local tokens.

### 2.3 Route & View Access Control (FR-RBAC)
- **FR-RBAC-1 (Backend Permission Gates):** The Django backend must implement custom permission classes matching user roles:
  - `IsAdminUser`: Restricts views to accounts with the role `ADMIN`.
  - `IsDoctorUser`: Restricts views to accounts with the role `DOCTOR`.
  - `IsReceptionistUser`: Restricts views to accounts with the role `RECEPTIONIST`.
  - `IsPatientUser`: Restricts views to accounts with the role `PATIENT`.
- **FR-RBAC-2 (Frontend Protected Routes):** The React client must wrap dashboard views in a `ProtectedRoute` wrapper component that:
  - Verifies presence and validity of the Access Token.
  - Verifies that the user's role is listed in the route's `allowedRoles` list.
  - Redirects unauthenticated clients to `/login`.
  - Redirects authenticated but unauthorized clients to a dedicated `/forbidden` page.

### 2.4 Client Session State Management (FR-STATE)
- **FR-STATE-1 (Global Authentication Context):** The frontend application must keep track of authentication states (`user`, `isAuthenticated`, `isLoading`, `error`) in a global React Context (`AuthProvider`) accessible by all components.
- **FR-STATE-2 (Axios Interceptors / Queue Refresh):** The React API client must implement an automatic token refresh interceptor:
  - Catch 401 Unauthorized API responses.
  - If a 401 occurs, intercept and queue all outgoing requests.
  - Execute a refresh request `/api/v1/auth/refresh/` using the stored refresh token.
  - If refresh succeeds, store the new access token, update the authorization header, and retry all queued requests.
  - If refresh fails (or refresh token is expired), clear local storage, drop the queue, and redirect the client to `/login`.

### 2.5 Credential Updates (FR-PASS)
- **FR-PASS-1 (Change Password Fields):** The change password service must require `old_password`, `new_password`, and `confirm_new_password`.
- **FR-PASS-2 (Password Confirmation Checks):** The service must reject the update with a 400 Bad Request error if `new_password` and `confirm_new_password` do not match.

---

## 3. Non-Functional Requirements

### 3.1 Security & Compliance (NFR-SEC)
- **NFR-SEC-1 (HTTPS Enforcement):** All API operations must run over HTTPS/TLS 1.2+ in production environments.
- **NFR-SEC-2 (No Hardcoded Fallbacks):** Database configuration strings, master keys, and API tokens must never be hardcoded into the codebase. Production systems must fail immediately (raise `ImproperlyConfigured`) on missing environment secrets.
- **NFR-SEC-3 (CORS Controls):** CORS configurations must restrict origin requests to verified frontend application domains in production.

### 3.2 Performance & Reliability (NFR-PERF)
- **NFR-PERF-1 (Latency SLAs):** User credential validation, token signature generation, and API responses must complete in under 500ms under standard loads.
- **NFR-PERF-2 (Stateless Scalability):** The backend must not maintain server-side session stores for authentication to support horizontal scaling.

### 3.3 Usability & UI Standards (NFR-UX)
- **NFR-UX-1 (Unified Styling):** All UI input elements must follow the Google Material Design 3 guidelines (border-radius, shapes, active-states) using the `Outfit` typography face.
- **NFR-UX-2 (Actionable Validation Feedback):** Form components must render precise, readable, field-specific validation warnings and global alert banners.
