# Software Requirements Specification (SRS)

## 1. Introduction

This document outlines the functional and non-functional requirements for the AI-Powered Hospital Management System (AI-HMS). 
*Note: Requirements are documented iteratively per milestone. Currently reflecting Milestone 1 (Authentication).*

## 2. Functional Requirements

### 2.1 User Management & Authentication

* **FR-1:** The system shall support role-based access control (RBAC) with roles: Administrator, Doctor, Receptionist, and Patient.
* **FR-2:** The system shall allow users to register and securely log in using JWT-based authentication.
* **FR-3:** Administrators shall be able to create, read, update, and delete (CRUD) user accounts.

*(Future modules like Patient Management, Appointments, and AI will be documented here in subsequent milestones).*

## 3. Non-Functional Requirements

### 3.1 Security & Privacy

* **NFR-1:** The system must securely hash passwords (e.g., using bcrypt).
* **NFR-2:** The system must restrict data access strictly according to user roles.
* **NFR-3:** All communication between the frontend and backend must occur over HTTPS.

*(Performance and scalability requirements will be expanded as the system grows).*
