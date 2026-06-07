# Milestone 1: Authentication & Authorization (Completed)

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Engineering Leads, QA Testers, Security Compliance
- **Status:** APPROVED & ARCHIVED
---

## 1. Overview
Milestone 1 establishes the baseline security, session state, and Role-Based Access Control (RBAC) foundation for the AI Hospital Management System (AI-HMS). By decoupling authorization checks and state management into a backend REST API and a client React context, we ensure secure clinical records access and horizontal scalability.

---

## 2. Requirements Compliance & Checklist

| Requirement ID | Description | Code Implementation | Status |
|:---|:---|:---|:---:|
| **BR-01** | Non-authenticated users cannot access patient information. | `IsAuthenticated` check on protected views. | ✅ |
| **BR-02** | Segregate user privileges across 4 user roles. | `IsAdminUser`, `IsDoctorUser` permissions in backend. | ✅ |
| **FR-01** | Allow public registrations. | `RegisterView` mapped to `/api/v1/auth/register/`. | ✅ |
| **FR-01-SEC**| Restrict registration role to PATIENT. | Role validation validator in `RegisterSerializer`. | ✅ |
| **FR-02** | Secure login credentials check. | `CustomTokenObtainPairView` mapped to `/auth/login/`. | ✅ |
| **FR-03** | Stateless token issuance (JWT). | DRF-SimpleJWT access/refresh token rotation. | ✅ |
| **FR-04** | Route and view protection. | `ProtectedRoute` components in frontend client. | ✅ |
| **FR-05** | Secure logout token invalidation. | `LogoutView` adding token signatures to blacklist. | ✅ |
| **FR-06** | Enforce RBAC checks. | DRF custom permission classes and router guards. | ✅ |
| **NFR-01** | Cryptographic password hashing. | Django UserManager default hashing (PBKDF2/bcrypt). | ✅ |
| **NFR-02** | HTTPS/TLS data in transit. | Platform-level deployment settings (Render/Vercel). | ✅ |
| **NFR-03** | Auto background token refresh. | Axios response queue interceptor in `axios.js`. | ✅ |

---

## 3. Key Functional Deliverables

### 3.1 Custom User Model
Stored in [`accounts/models.py`](file:///e:/Download/solid%20project/AI-HMS/backend/accounts/models.py):
- Inherits from Django's secure `AbstractUser`.
- Removes the `username` field; enforces the `email` column as the unique credential indicator.
- Overrides `id` with secure, non-sequential UUID primary keys.
- Implements `CustomUserManager` to normalization inputs and securely handle password hashing.

### 3.2 State Management & Hook Operations
Stored in [`AuthContext.jsx`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/features/auth/context/AuthContext.jsx):
- Maintains user profile, loading state, error states, and session indicators globally in React context.
- Implements an automated token verification on application startup (decodes JWT payload and queries profile in background if token is valid).
- Refactored `useAuth` custom hook to consume context state.

### 3.3 Axios Auto-Refresh Interceptor
Stored in [`axios.js`](file:///e:/Download/solid%20project/AI-HMS/frontend/src/shared/services/axios.js):
- Automatically catches `401 Unauthorized` responses.
- Locks the request channel and queues all subsequent outgoing requests.
- Issues a refresh call `/api/v1/auth/refresh/` using the local refresh token.
- Repopulates access tokens and retries all original requests automatically on success; clears storage and redirects to `/login` on failure.

---

## 4. Verification & Validation Outputs

### 4.1 Django Backend Test Suite
Running `python manage.py test` executes 12 unit tests validating model properties, serializers validation logic, custom permissions, and view responses (Registration restrictions, Login credentials, Token refresh, and Password modifications):

```
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
............
----------------------------------------------------------------------
Ran 12 tests in 39.441s

OK
Destroying test database for alias 'default'...
```

### 4.2 Frontend Build Compilation
Running `npm run build` bundles React components and Outfit font assets into deployment chunks without warnings:

```
vite v8.0.16 building client environment for production...
transforming...✓ 1009 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                           0.47 kB
dist/assets/index-CmTG1Cuq.css                            4.79 kB
dist/assets/index-CfPDdng4.js                           554.01 kB

✓ built in 1.55s
```
---
*End of Milestone 1 Technical Archive.*
