# Product Backlog: User Stories & Requirements

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Status:** ACTIVE
- **Last Updated:** June 6, 2026
---

## 🟢 Milestone 0: Public Landing Page & Design System (Completed)

### 0a. Responsive Landing Page Layout & Navbar
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As a portal visitor, I want a modern responsive landing page with sections explaining patient and hospital portals so I can learn about Al Shifaa.

### 0b. Global Cookie Consent preferences
* **Priority:** Medium
* **Status:** COMPLETED
* **Story Points:** 3
* **User Story:** As a visitor, I want to manage my analytics cookies preferences using an interactive popup banner to protect my privacy.

### 0c. Heartbeat loading overlay transition
* **Priority:** Medium
* **Status:** COMPLETED
* **Story Points:** 2
* **User Story:** As a user, I want a custom heartbeat loading indicator when pages or sessions initialize so the app feels responsive and premium.

---

## 🟢 Milestone 1: Authentication & User Management (Completed)

### 1. Codebase Scaffolding & CI Integration
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 3
* **User Story:** As a developer, I want to initialize the React and Django projects so that development can begin.

### 2. Public User Registration Validation
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As a user, I want to register a new account so that I can access the system.
* **Security Check:** Restricts role registration strictly to `PATIENT` only to prevent administrative or clinical account self-assignment.

### 3. Stateless Token Authentication (JWT)
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As a user, I want to securely log in with an email and password using JWT so my data is protected.

### 4. Client-Side Session Continuity (Axios Refresh Interceptor)
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As a logged-in user, I want my frontend requests to automatically renew my access token in the background using my refresh token.

### 5. Role-Based Access Control (RBAC) Protection
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As the system, I want to restrict page and API route access based on the user's role (Admin/Doctor/Patient/Receptionist) so that data remains secure.

### 5a. Google OAuth SSO & Profile Completion Onboarding
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 8
* **User Story:** As a user, I want to authenticate using my Google credentials and complete any missing details before accessing my workspace.

### 5b. Password Recovery OTP Code Verification
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 5
* **User Story:** As a user who forgot their password, I want to generate a 6-digit verification code and reset my credentials.

### 5c. Doctor Onboarding & Staff Invitations
* **Priority:** High
* **Status:** COMPLETED
* **Story Points:** 8
* **User Story:** As a doctor, I want to submit my PMDC credentials and licensing proofs so that administrators can review my application and invite me.

---

## 📅 Milestone 2: Professional Admin Layout & Workspace Routing (Next Milestone)

### 6. Collapsible Left Navigation Drawer (AdminDrawer)
* **Priority:** High
* **Status:** TO DO
* **Story Points:** 5
* **User Story:** As an administrator, I want to toggle a collapsible navigation sidebar so that I can maximize my workspace screen estate while navigating between administrative modules.

### 7. Custom Admin Breadcrumbs & Notifications Header
* **Priority:** High
* **Status:** TO DO
* **Story Points:** 5
* **User Story:** As an administrator, I want to view a dynamic breadcrumb trail, access a notifications center, and view my profile details in the layout header.

### 7b. Admin Workspace Sub-Routing & Visual Mock-ups
* **Priority:** High
* **Status:** TO DO
* **Story Points:** 5
* **User Story:** As an administrator, I want to switch between different workspace tabs (Overview, Invites, Applications, Users, Audits) with smooth page transition animations.

---

## 📅 Milestone 3: Operational Scheduling

### 8. Appointment Booking Workflow
* **Priority:** High
* **Status:** BACKLOG
* **Story Points:** 8
* **User Story:** As a patient, I want to book an appointment slot checking clinician availability, preventing overlapping sessions.

---

## 📅 Milestone 4: EHR & Prescriptions

### 9. Clinical Record Creation
* **Priority:** High
* **Status:** BACKLOG
* **Story Points:** 8
* **User Story:** As a doctor, I want to view a patient's historical EHR and write diagnostic notes and prescriptions.

---

## 📅 Milestone 5: Intelligent Assistant & RAG Features

### 10. AI-Generated Patient History Summaries
* **Priority:** Medium
* **Status:** BACKLOG
* **Story Points:** 13
* **User Story:** As a doctor, I want the system to generate a compiled summary of a patient's clinical history to reduce prep time.
