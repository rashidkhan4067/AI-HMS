# Product Backlog: User Stories & Requirements

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Status:** ACTIVE
- **Last Updated:** June 6, 2026
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

---

## 📅 Milestone 2: Patient & Clinician Directory (Next Milestone)

### 6. Patient Onboarding & Profile Registry
* **Priority:** High
* **Status:** TO DO
* **Story Points:** 8
* **User Story:** As a receptionist, I want to register a new patient and automatically generate a unique Medical Record Number (MRN).

### 7. Clinician Directory Registry
* **Priority:** High
* **Status:** TO DO
* **Story Points:** 5
* **User Story:** As an administrator, I want to create doctor profiles with specialties, license numbers, and scheduling shifts.

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
