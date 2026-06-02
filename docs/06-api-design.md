# API Design Document: Authentication & Authorization

**Project:** AI Hospital Management System (AI-HMS)  
**Milestone:** 01 - Authentication & Authorization  
**Framework:** Django REST Framework (DRF)  

---

## 1. Endpoint List

| Method | Endpoint | Description | Auth Required | Role |
|---|---|---|---|---|
| POST | `/api/v1/auth/register/` | Register a new user account. | No | Any |
| POST | `/api/v1/auth/login/` | Authenticate user and return JWTs. | No | Any |
| POST | `/api/v1/auth/refresh/` | Obtain a new access token using a refresh token. | No | Any |
| POST | `/api/v1/auth/logout/` | Blacklist the current refresh token. | Yes | Any |
| GET | `/api/v1/auth/me/` | Retrieve the authenticated user's profile data. | Yes | Any |

---

## 2. Request Models

### 2.1 Registration Request (`/api/v1/auth/register/`)
```json
{
  "email": "doctor.smith@aihms.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Smith",
  "role": "DOCTOR"
}
```

### 2.2 Login Request (`/api/v1/auth/login/`)
```json
{
  "email": "doctor.smith@aihms.com",
  "password": "SecurePassword123!"
}
```

### 2.3 Token Refresh Request (`/api/v1/auth/refresh/`)
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

---

## 3. Response Models

### 3.1 Registration / Profile Success (201 Created / 200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
  "email": "doctor.smith@aihms.com",
  "first_name": "John",
  "last_name": "Smith",
  "role": "DOCTOR",
  "created_at": "2026-06-02T10:00:00Z"
}
```

### 3.2 Login Success (200 OK)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

---

## 4. Error Responses

### 4.1 Validation Error (400 Bad Request)
```json
{
  "email": ["User with this email already exists."],
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```

### 4.2 Authentication Failed (401 Unauthorized)
```json
{
  "detail": "No active account found with the given credentials"
}
```

### 4.3 Permission Denied (403 Forbidden)
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

## 5. Validation Rules
* **Email:** Must be a valid email format. Must be unique in the `core_user` table. Case-insensitive normalization applied before saving.
* **Password:** Must be at least 8 characters long. Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
* **Role:** Must be one of the predefined Enum choices: `['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']`.
* **Names:** `first_name` and `last_name` cannot be blank and have a maximum length of 50 characters.

---

## 6. JWT Authentication Flow
1. The client issues a `POST /login/` request.
2. DRF-SimpleJWT validates credentials against the database.
3. Upon success, a payload is signed using the Django `SECRET_KEY` (HS256 algorithm). The payload includes `user_id`, `exp` (expiration time), and a custom `role` claim.
4. The **Access Token** is configured to expire in 15 minutes.
5. The **Refresh Token** is configured to expire in 7 days.
6. For protected endpoints (e.g., `/me/`), DRF checks the `Authorization: Bearer <token>` header, verifies the signature, and ensures it is not expired.

---

## 7. Security Requirements
* **HTTPS/TLS:** Mandatory for all API communication to prevent token interception.
* **Rate Limiting:** Login endpoints must be rate-limited (e.g., max 5 failed attempts per minute per IP) to mitigate brute-force attacks (using `django-ratelimit` or DRF throttling).
* **Token Blacklisting:** When `/logout/` is called, the Refresh Token must be added to a blacklist database table (via `rest_framework_simplejwt.token_blacklist`) to prevent it from generating future Access Tokens.

---

## 8. API Versioning Strategy
The API utilizes **URL Path Versioning** to ensure backward compatibility as the hospital system evolves.
* Current active version: `v1`
* Base URL prefix: `/api/v1/`
* If a breaking schema change occurs in the future (e.g., moving from RBAC to ABAC), the prefix will increment to `/api/v2/`.

---

## 9. OpenAPI Structure
The API will automatically generate a dynamic OpenAPI 3.0 specification schema (via `drf-spectacular`). 
This schema will be accessible natively at `/api/schema/` and will render a Swagger UI at `/api/docs/` for interactive developer testing. 

* **Auth Declaration:** The OpenAPI spec will globally declare HTTP Bearer Auth so that the Swagger UI can automatically inject the JWT into requests.
