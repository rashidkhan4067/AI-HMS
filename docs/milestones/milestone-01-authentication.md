# Authentication Requirements Document

**Project:** AI Hospital Management System (AI-HMS)  
**Milestone:** Authentication & Authorization  
**Methodology:** Agile (Kanban Workflow)  

---

## 1. Module Overview
The Authentication & Authorization module serves as the foundational security layer for the AI-HMS. Its primary objective is to verify user identity, manage secure sessions, and enforce role-based access control (RBAC). Given the highly sensitive nature of medical data, this module acts as the critical gatekeeper, ensuring that data is only accessible to authorized personnel strictly within the bounds of their operational privileges.

## 2. Business Requirements
* **BR-01:** The system must comply with baseline healthcare data privacy standards by ensuring no unauthenticated user can access patient health information.
* **BR-02:** The system must support diverse operational roles (clinical, administrative, and patients) with strictly segregated privileges to streamline hospital workflows.
* **BR-03:** The authentication process must be seamless and fast to avoid impeding doctors and staff during emergency or high-traffic situations.

## 3. Functional Requirements
* **FR-01 (Registration):** The system shall allow new users to register by providing their First Name, Last Name, Email, Password, and Role.
* **FR-02 (Secure Login):** The system shall authenticate users via Email and Password credentials.
* **FR-03 (Token Issuance):** Upon successful authentication, the system shall issue a JSON Web Token (JWT) comprising an Access Token and a Refresh Token.
* **FR-04 (Route Protection):** The system shall intercept unauthorized requests to protected endpoints and redirect the user to the login portal.
* **FR-05 (Logout):** The system shall provide a mechanism for users to securely terminate their session by invalidating the client-side tokens.
* **FR-06 (Role Verification):** The system shall verify the encoded role within the JWT on every protected request to determine authorization validity.

## 4. Non-Functional Requirements
* **NFR-01 (Security):** Passwords must be hashed using industry-standard cryptographic algorithms (e.g., bcrypt or Argon2) prior to database storage. Plaintext passwords must never be logged or stored.
* **NFR-02 (Security):** All authentication payloads and token transmissions must be encrypted in transit via HTTPS/TLS 1.2+.
* **NFR-03 (Performance):** The login authentication process (database lookup, hash verification, and token generation) must complete in under 500ms under normal load.
* **NFR-04 (Usability):** The login and registration interfaces must be responsive, mobile-friendly, and provide clear, actionable error messages (e.g., "Invalid credentials" rather than "User not found").

## 5. User Roles
The system implements Role-Based Access Control (RBAC) with the following strictly defined entities:
* **Admin:** Unrestricted access. Can manage (CRUD) all user accounts, view overarching hospital dashboards, and configure system-wide settings.
* **Doctor:** Clinical access. Can view assigned patient histories, manage their own appointments, and write clinical notes/prescriptions.
* **Receptionist:** Operational access. Can register patients, manage appointment schedules, and view basic patient demographics (excluding clinical notes).
* **Patient:** Restricted access. Can solely view their own personal profile, medical history, and book appointments. Cannot access data of other patients.

## 6. Acceptance Criteria
* **AC-01:** Given a valid email and password, when a user attempts to log in, then the system returns a 200 OK with valid JWT access and refresh tokens.
* **AC-02:** Given an invalid password, when a user attempts to log in, then the system returns a 401 Unauthorized with a generic error message.
* **AC-03:** Given a valid Patient token, when the user attempts to access an Admin-only dashboard endpoint, then the system returns a 403 Forbidden.
* **AC-04:** Given a missing or expired access token, when a user requests a protected route, then the system returns a 401 Unauthorized and the frontend redirects to the login page.

## 7. Assumptions
* Users have access to modern, compliant web browsers.
* The hospital network infrastructure supports HTTPS traffic.
* Email addresses are assumed to be unique identifiers for all users across the system.

## 8. Constraints
* The module must be implemented using Django REST Framework (Backend) and React.js (Frontend).
* Authentication state must rely on stateless JWTs; server-side session caching (like Redis) is out of scope for Milestone 1 to reduce architectural complexity.
* Multi-Factor Authentication (MFA) and Single Sign-On (SSO) are out of scope for this initial milestone.

## 9. Success Criteria
* **SC-01:** 100% of API endpoints (excluding `/login` and `/register`) successfully reject unauthenticated requests.
* **SC-02:** Frontend architecture successfully routes users based on their authenticated state without infinite redirection loops.
* **SC-03:** The foundational database schema successfully persists user identities and roles, passing all unit tests for the Custom User model.
