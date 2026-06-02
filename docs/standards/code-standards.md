# Code Standards

## Purpose
This document defines coding standards for the AI Hospital Management System (AI-HMS) to ensure consistency, readability, and maintainability across the entire codebase.

## General Principles
* **Clean Code:** Follow Clean Code principles at all times.
* **Self-Explanatory:** Write self-explanatory code where the structure and naming convey the intent.
* **DRY (Don't Repeat Yourself):** Avoid duplicated logic by abstracting reusable code into utility functions or shared components.
* **Small Functions:** Keep functions small and focused on a single task.
* **SRP (Single Responsibility Principle):** Every class, module, or function should have one, and only one, reason to change.

## Naming Conventions

### Variables
Use descriptive `camelCase` for JavaScript variables and `snake_case` for Python variables.
* **Good:** `userProfile`, `appointmentList`
* **Bad:** `x`, `data`, `temp`

### Functions
Function names should be action-oriented verbs.
* **Good:** `createPatient()`, `getUserProfile()`, `updateAppointment()`
* **Bad:** `doStuff()`, `process()`

### Classes
Use `PascalCase` for all class names (both frontend and backend).
* **Examples:** `UserService`, `AppointmentManager`, `PatientSerializer`

## File Naming

### Frontend (React/JS)
* **Components & Pages:** `PascalCase.jsx` (e.g., `LoginPage.jsx`, `PatientTable.jsx`)
* **Utilities & Services:** `PascalCase.js` or `camelCase.js` depending on exports, but prefer consistency (e.g., `AuthService.js`)

### Backend (Django/Python)
* **Modules:** `snake_case.py` (e.g., `views.py`, `serializers.py`, `services.py`)

## Comments
Write comments **only when necessary** to explain *why* something is done, not *what* is being done. The code should explain the *what*.
* **Prefer:** Self-documenting functions like `calculateTotalAmount()`
* **Instead of:** Redundant comments like `# Calculate total amount` above a poorly named function.

## Git Commit Standards
We follow the Conventional Commits specification to generate clear, readable commit histories.

**Examples:**
* `feat(auth): implement JWT login`
* `feat(patient): create patient CRUD`
* `fix(auth): resolve token refresh issue`
* `docs(api): update authentication endpoints`
