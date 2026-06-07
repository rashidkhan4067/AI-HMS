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

## Authentication & Security Philosophy

> **Al Shifaa HMS follows claim-based identity with server-side role resolution, zero trust request validation, RBAC permission enforcement, and controlled onboarding — users prove identity, the system determines access.**

### Identity-Driven UI
There is one login page for everyone — doctor, receptionist, admin, nurse, pharmacist, patient. No dropdowns, no role selection, no separate URLs for different staff. Just email and password (or Google SSO). After authentication, the server-issued JWT token contains the role claim. The frontend reads it and renders the correct dashboard. For example, a receptionist sees the reception dashboard, a doctor sees the doctor dashboard, and an admin sees everything. The server determines the layout based on who the user is.

### Controlled Onboarding (Provisioning vs Self-Registration)
As an enterprise Hospital Management System, Al Shifaa HMS implements a provisioning-assisted flow rather than open self-registration. Clinical staff (such as doctors and nurses) apply for accounts, and an administrator provisions/activates them with the appropriate role and department.

## Project Status

🚧 Currently in Development — Milestone 1: Authentication & Authorization

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
