# API Design Document: Authentication & Session Operations

---
**Metadata**
- **Document Version:** 1.1 (Milestone 1 Completed)
- **Base URL Endpoint:** `/api/v1/`
- **Response Format:** JSON
- **Status:** APPROVED
---

## 1. REST Endpoint Specifications

| HTTP Method | Route URL | Description | Auth Type | Access Context / Restrictive Rules |
|:---:|:---|:---|:---:|:---|
| **POST** | `auth/register/` | Public signup for clinicians. | None | Initiates clinical account registration (requires invite token). |
| **POST** | `auth/register-invited/` | Clinical invitation signup. | None | Completes signup for staff/doctors using invite tokens. |
| **POST** | `auth/register-patient/` | Public patient registration. | None | Public signup. Auto-authenticates and returns session tokens. |
| **POST** | `auth/login/` | User credentials verification. | None | Verifies email/password. Sets HttpOnly refresh cookie. |
| **POST** | `auth/google/` | Google OAuth Single Sign-On. | None | authenticates using ID token or Access token. |
| **POST** | `auth/token/refresh/` | JWT access token renewal. | None | Renews expired access token using HttpOnly refresh cookie. |
| **POST** | `auth/logout/` | Active session invalidation. | Bearer JWT | Blacklists the refresh token and clears HTTP cookies. |
| **GET** | `auth/me/` | Retrieves profile properties. | Bearer JWT | Returns current authenticated user record. |
| **PATCH** | `auth/me/` | Modifies profile properties. | Bearer JWT | Updates profile fields (e.g. `full_name`). |
| **PUT** | `auth/change-password/` | Updates user password credentials.| Bearer JWT | Changes user password. |
| **POST** | `auth/check-email/` | Username preview resolver. | None | Returns account role preview for custom login animations. |
| **POST** | `auth/validate-invite/`| Invitation token validation. | None | Confirms validity and retrieves details of invitation tokens. |

---

## 2. Request & Response Payload Models

### 2.1 Patient Registration (`POST auth/register-patient/`)
- **Request Body:**
  ```json
  {
    "email": "rashidkhang1046@gmail.com",
    "password": "SecurePassword123!",
    "full_name": "Muhammad Rashid Shafique",
    "dob": "1998-07-09",
    "gender": "MALE",
    "cnic": "32302-1065721-7",
    "phone": "+923198696623",
    "emergency_contact_name": "Muhammad Shafique",
    "emergency_contact_relationship": "Father",
    "emergency_contact_phone": "+923007189601"
  }
  ```
- **Response Body (210 Created / 200 OK):**
  Auto-authenticates the patient and returns tokens:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl9... ",
    "must_complete_profile": false,
    "redirect_to": "/patient/dashboard",
    "user": {
      "id": "c1f7b8b4-4b52-47ef-8d6e-826d17cf9051",
      "email": "rashidkhang1046@gmail.com",
      "full_name": "Muhammad Rashid Shafique",
      "role": "PATIENT",
      "department": null,
      "department_name": null,
      "employee_id": null,
      "phone": "+923198696623",
      "must_complete_profile": false,
      "created_at": "2026-06-07T16:50:00Z"
    }
  }
  ```
  *Cookie set: `refresh_token` (HttpOnly, Secure, SameSite=Strict)*

---

### 2.2 Credentials Authentication (`POST auth/login/`)
- **Request Body:**
  ```json
  {
    "email": "rashidkhang4067@gmail.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Body (200 OK):**
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "ADMIN",
    "email": "rashidkhang4067@gmail.com",
    "must_complete_profile": false
  }
  ```
  *Cookie set: `refresh_token` (HttpOnly, Secure, SameSite=Strict)*

---

### 2.3 Profile Operations (`GET` & `PATCH` `auth/me/`)
- **Response Body (200 OK):**
  ```json
  {
    "id": "c1f7b8b4-4b52-47ef-8d6e-826d17cf9051",
    "email": "rashidkhang1046@gmail.com",
    "full_name": "Muhammad Rashid Shafique",
    "role": "PATIENT",
    "department": null,
    "department_name": null,
    "employee_id": null,
    "phone": "+923198696623",
    "must_complete_profile": false,
    "created_at": "2026-06-07T16:50:00Z"
  }
  ```
- **PATCH Request Body (updating settings):**
  ```json
  {
    "full_name": "Muhammad Rashid Shafique (Edited)"
  }
  ```

---

## 3. Error Classification

### 3.1 Field-Level Errors (400 Bad Request)
Returned when payload validation fails on serializer constraints (e.g. invalid CNIC, duplicate email, rate limits):
```json
{
  "email": [
    "hms_user with this email address already exists."
  ],
  "cnic": [
    "CNIC must be in the format XXXXX-XXXXXXX-X"
  ]
}
```

### 3.2 Authentication Error (401 Unauthorized)
Returned on invalid credentials or expired signatures:
```json
{
  "detail": "No active account found with the given credentials"
}
```
*Note: Public auth endpoints (login, register, reset-password, verify-otp, check-email, validate-invite) automatically bypass Authorization headers on the frontend to prevent 401 token authentication loops on DRF.*
