# User Stories: Authentication & Access Control (Milestone 1)

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Product Managers, Frontend Engineers, QA Engineers
- **Status:** APPROVED
---

## 1. User Stories & Acceptance Criteria

### 1.1 US-1: Public Patient Account Onboarding
> **As a new patient**  
> **I want to** register an account using my email, password, and name  
> **So that** I can securely access the clinic portal to book appointments and view my records.

#### Acceptance Criteria
- **AC-1.1:** Given a registration form, when I supply a unique email, a full name, a valid password, and attempt to sign up, the system creates the account and sets the role to `PATIENT`.
- **AC-1.2:** Given the registration form, when I attempt to register with a role other than `PATIENT` (such as `DOCTOR` or `ADMIN`), the registration is rejected with an explicit error message.
- **AC-1.3:** Given a registration attempt, when I supply an email that is already registered, the system returns a validation error indicating the email is taken.

---

### 1.2 US-2: Secure Identity Authentication
> **As a registered user**  
> **I want to** authenticate using my email and password credentials  
> **So that** I can obtain access and refresh tokens to communicate securely with protected endpoints.

#### Acceptance Criteria
- **AC-2.1:** Given valid login credentials, when I submit my details, the system returns a `200 OK` code containing valid JWT access and refresh tokens along with my role and email.
- **AC-2.2:** Given invalid login credentials, when I submit my details, the system returns a `401 Unauthorized` code with a generic validation error message.

---

### 1.3 US-3: Automated Session Renewal
> **As a signed-in portal user**  
> **I want** my React application to refresh my expired access token automatically in the background using my refresh token  
> **So that** I can experience uninterrupted workflows without having to log in again every 15 minutes.

#### Acceptance Criteria
- **AC-3.1:** Given an expired access token, when I execute an API request (such as fetching my profile), the frontend Axios client intercepts the `401` error, requests a new access token, updates the header, and executes the original request successfully without user intervention.
- **AC-3.2:** Given an invalid or expired refresh token, when the Axios client attempts to fetch a new access token, the request fails, the tokens are cleared from storage, and I am redirected to `/login`.

---

### 1.3 US-4: Secure Session Terminate (Logout)
> **As an authenticated user**  
> **I want to** sign out of my current session  
> **So that** my active refresh tokens are invalidated on the server and my local credentials are deleted.

#### Acceptance Criteria
- **AC-4.1:** Given a signed-in state, when I click "Logout", the frontend issues a `POST` request to the logout API with my refresh token, blacklisting it on the server database.
- **AC-4.2:** Given a logged-out request, when I check my local storage, all access and refresh tokens are deleted, and I am redirected back to the login page.

---

### 1.5 US-5: User Route Protection & Role Checks (RBAC)
> **As the clinic platform manager**  
> **I want** the client routing and backend APIs to check the user's role before exposing pages or database records  
> **So that** patients cannot access clinical operations and staff cannot access admin settings.

#### Acceptance Criteria
- **AC-5.1:** Given a route requiring an `ADMIN` role, when a user with a `PATIENT` role attempts to access the route, they are automatically redirected to a dedicated `/forbidden` access denied page.
- **AC-5.2:** Given a backend clinical endpoint, when a user with a `PATIENT` role attempts to request data, the Django backend checks the token role and returns a `403 Forbidden` response.

---

### 1.6 US-6: Credential Modification & Confirmation
> **As a logged-in user**  
> **I want to** update my current password  
> **So that** I can maintain my account security.

#### Acceptance Criteria
- **AC-6.1:** Given a password change request, when I provide my old password, my new password, and my confirm password correctly, the system updates my credentials.
- **AC-6.2:** Given a password change request, when the confirm new password does not match the new password, the system rejects the request with a validation warning.

---

### 1.7 US-7: Google Single Sign-On & Account Linking
> **As a clinical or patient portal user**  
> **I want to** log in using my Google credentials  
> **So that** I can access the system securely and quickly without remembering another password.

#### Acceptance Criteria
- **AC-7.1:** Given an active account matching my Google email, when I authenticate using Google SSO, the system logs me in and associates my profile with my Google ID.
- **AC-7.2:** Given a new Google SSO session, when my email does not match any registered user, the system rejects the login and informs me that I must register first.
- **AC-7.3:** Given a successful Google SSO session, when my account profile is incomplete (e.g. missing department for staff), the frontend redirects me to complete my profile before allowing access to my dashboard.

---

### 1.8 US-8: Password Reset via OTP Code
> **As a registered user who forgot their password**  
> **I want to** receive a 6-digit verification code on my email  
> **So that** I can safely verify my identity and reset my password.

#### Acceptance Criteria
- **AC-8.1:** Given a password reset request, when I submit my registered email, the system generates a 6-digit OTP code, sends it to my email address, and returns a success response.
- **AC-8.2:** Given an OTP verification submission, when I enter the correct, unexpired OTP code, the system validates the request and returns a one-time session reset token.
- **AC-8.3:** Given a new password submission with a valid reset session token, when the passwords match, the system updates my password and invalidates all previous OTP codes.

---

### 1.9 US-9: Doctor Onboarding Application
> **As a medical doctor wishing to join the hospital network**  
> **I want to** submit a digital application form with my credentials and document proofs  
> **So that** the system administrator can verify my licenses and invite me to onboard.

#### Acceptance Criteria
- **AC-9.1:** Given the doctor application form, when I fill in my PMDC number, specialization, experience, and upload valid PMDC/CNIC PDF/JPEG documents (<5MB), the system saves my application as `PENDING`.
- **AC-9.2:** Given the doctor application form, when I upload a file larger than 5MB or with an unsupported extension (e.g. ZIP), the system rejects the file and shows an error message.

