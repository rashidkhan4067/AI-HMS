# AI Hospital Management System (AI-HMS)

AI-HMS is a modern full-stack Hospital Management System designed to streamline healthcare operations through secure user management, patient records, doctor management, appointment scheduling, and AI-powered assistance.

## Tech Stack

* Frontend: React.js
* Backend: Django REST Framework
* Database: PostgreSQL
* Authentication: JWT
* AI Integration: Large Language Models (LLMs)

## Development Methodology

This project follows:

* Agile Development
* Milestone-Based Planning
* Kanban Workflow
* Git Version Control
* Progressive Documentation
* CI/CD and Docker (planned)

## Project Status

✅ **Milestone 1: Authentication & Authorization — COMPLETED**
- Custom User Model (UUID keys, email authentication)
- Stateless JWT-based authentication with token rotation & blacklist on logout
- Google OAuth SSO integration & Profile Completion workflow
- Multi-step Patient self-registration & Doctor Onboarding application submissions
- Global `AuthContext` with custom hooks & Axios auto-refresh interceptors
- Role-Based Access Control (RBAC) frontend guards & custom backend permission classes
- Responsive split-panel Auth layout (light/dark theme modes) with Cookie Consent & Global heartbeat loader


## Planned Modules

* Authentication & Authorization
* Patient Management
* Doctor Management
* Appointment Management
* Medical Records
* Prescriptions
* Reports & Analytics
* AI Assistant
* AI-Powered Medical Summaries
* DevOps & Deployment
