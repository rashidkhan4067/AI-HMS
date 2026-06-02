# Project Roadmap

This roadmap breaks down the high-level milestones from the Project Charter into actionable steps for the AI-HMS development.

## Phase 1: Project Planning and System Design

* **Goal:** Finalize requirements, architecture, and setup environments.
* **Tasks:**
  * Complete SRS, User Stories, and Architecture docs.
  * Define Database Schema.
  * Initialize Git repository and setup CI/CD pipeline (GitHub Actions).
  * Setup base Django project and React application scaffolds.

## Phase 2: Authentication and User Management

* **Goal:** Implement secure access control.
* **Tasks:**
  * Implement custom User model in Django.
  * Setup JWT authentication endpoints (login, refresh).
  * Implement role-based permissions (Admin, Doctor, Patient, Receptionist).
  * Build Frontend login page and route protection.

## Phase 3: Patient and Doctor Management

* **Goal:** Core CRUD operations for primary hospital actors.
* **Tasks:**
  * Create Patient and Doctor API endpoints.
  * Build Frontend dashboards for Admin to manage users.
  * Build profile pages for Patients and Doctors.

## Phase 4: Appointment and Medical Records Management

* **Goal:** Digitize the hospital workflow.
* **Tasks:**
  * Implement Appointment booking logic and API.
  * Build Frontend calendar/scheduling views for Doctors and Receptionists.
  * Implement Medical Record and Prescription APIs.
  * Build Frontend forms for Doctors to add records and prescriptions.

## Phase 5: AI Feature Development

* **Goal:** Integrate intelligence into the system.
* **Tasks:**
  * Select LLM provider (OpenAI, Anthropic, etc.).
  * Implement RAG backend logic for querying patient history.
  * Build the "Summarize Patient History" feature for Doctors.
  * Implement the AI Chatbot interface on the frontend.
  * Develop intelligent appointment slot recommendations.

## Phase 6: Testing, Deployment, and Documentation

* **Goal:** Prepare the system for production.
* **Tasks:**
  * Write unit and integration tests (Backend & Frontend).
  * Perform user acceptance testing (UAT).
  * Deploy database (e.g., Supabase, AWS RDS).
  * Deploy backend (e.g., Render, Heroku, AWS EC2).
  * Deploy frontend (e.g., Vercel, Netlify).
  * Finalize user manuals and API documentation.
