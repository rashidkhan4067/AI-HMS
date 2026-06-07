# System Architecture Design: Authentication & Access Control

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** System Architects, Backend Developers, Security Reviewers
- **Status:** APPROVED
---

## System Authentication & Security Philosophy

> **Al Shifaa HMS follows claim-based identity with server-side role resolution, zero trust request validation, RBAC permission enforcement, and controlled onboarding — users prove identity, the system determines access.**

### Identity-Driven UI
There is one login page for everyone — doctor, receptionist, admin, nurse, pharmacist, patient. No dropdowns, no role selection, no separate URLs for different staff. Just email and password (or Google SSO). After authentication, the server-issued JWT token contains the role claim. The frontend reads it and renders the correct dashboard. For example, a receptionist sees the reception dashboard, a doctor sees the doctor dashboard, and an admin sees everything. The server determines the layout based on who the user is.

### Controlled Onboarding (Provisioning vs Self-Registration)
As an enterprise Hospital Management System, Al Shifaa HMS implements a provisioning-assisted flow rather than open self-registration. Clinical staff (such as doctors and nurses) apply for accounts, and an administrator provisions/activates them with the appropriate role and department.

## 1. System Topology & Layers

The system is structured as a decoupled Single Page Application (SPA) communicating with a stateless REST API backend. 

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 / Vite)                   │
│                                                                 │
│   ┌────────────────────┐   ┌──────────────┐   ┌─────────────┐   │
│   │    Mui M3 UI       │   │  useAuth()   │   │ AuthContext │   │
│   │ (LoginForm, etc.)  │──>│ Custom Hook  │──>│ Global State│   │
│   └────────────────────┘   └──────────────┘   └─────────────┘   │
│                                                      │          │
│                                                      ▼          │
│                                               ┌─────────────┐   │
│                                               │ Axios Client│   │
│                                               │(Interceptors│   │
│                                               └─────────────┘   │
└──────────────────────────────────────────────────────│──────────┘
                                                       │ HTTPS (Bearer Token)
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               Backend Services (Django DRF / Python)            │
│                                                                 │
│   ┌────────────────────┐   ┌──────────────┐   ┌─────────────┐   │
│   │    WSGI / URL      │   │  SimpleJWT   │   │ Custom DRF  │   │
│   │    Routing         │──>│Middleware Gate│──>│ Permissions │   │
│   └────────────────────┘   └──────────────┘   └─────────────┘   │
│                                                      │          │
│                                                      ▼          │
│                                               ┌─────────────┐   │
│                                               │ Django ORM  │   │
│                                               └─────────────┘   │
└──────────────────────────────────────────────────────│──────────┘
                                                       │ Database Connection
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Database Layer                          │
│                                                                 │
│                 ┌─────────────────────────────┐                 │
│                 │      PostgreSQL (Neon)      │                 │
│                 │ (SQLite in testing context) │                 │
│                 └─────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Diagram

```mermaid
graph TD
    subgraph Client [React SPA Client]
        A[Login / Register Pages]
        B[Global AuthContext Provider]
        C[useAuth Hook]
        D[Axios Interceptors]
        E[ProtectedRoute Wrapper]
    end

    subgraph Service [Django API Server]
        F[JWT Authentication Middleware]
        G[Custom Role Permissions]
        H[Account Views / Serializers]
        I[SimpleJWT Token Blacklist]
    end

    subgraph Database [Database Engine]
        J[(PostgreSQL Database)]
    end

    A -->|Consume hook| C
    C -->|Reads state| B
    C -->|Trigger HTTP| D
    E -->|Validates token role| B
    D -->|Send Request| F
    F -->|Verify Signature| G
    G -->|Enforce RBAC| H
    H -->|Query user records| J
    H -->|Blacklist tokens| I
    I --> J
```

---

## 3. Core Interaction Workflows

### 3.1 Login & Token Issuance Flow
1. **Submission:** User enters email and password.
2. **Server Check:** Backend validates credentials using the `CustomTokenObtainPairSerializer` class.
3. **Payload Construction:** The backend returns an Access Token (15-minute expiration) and a Refresh Token (7-day expiration).
4. **Extra Body Data:** The login API response contains the `role` and `email` directly in the JSON response payload.
5. **State Initialization:** The React `AuthContext` initializes the session, stores tokens, and populates the global `user` state.

---

### 3.2 Automated Token Refresh Flow (Axios Queue Interceptor)
When an access token expires, client requests fail with an HTTP 401 response code. The Axios client automatically handles recovery:

```mermaid
sequenceDiagram
    participant UI as Component / View
    participant Ax as Axios Interceptor
    participant API as Django REST API

    UI->>Ax: Request Protected Endpoint (/api/v1/auth/me/)
    Ax->>API: GET /auth/me/ (Header: Bearer [Expired Token])
    API-->>Ax: 401 Unauthorized (Expired Signature)
    Note over Ax: Interceptor locks requests,<br/>creates retry queue.
    Ax->>API: POST /auth/refresh/ { refresh: [Refresh Token] }
    alt Refresh Success
        API-->>Ax: 200 OK { access: [New Access Token] }
        Note over Ax: Store new Access Token in localStorage.<br/>Release queued requests.
        Ax->>API: GET /auth/me/ (Header: Bearer [New Access Token])
        API-->>Ax: 200 OK (User Data)
        Ax-->>UI: Return Data
    else Refresh Failed / Expired
        API-->>Ax: 401 Unauthorized (Invalid Refresh Token)
        Note over Ax: Clear localStorage credentials.<br/>Redirect user to /login.
        Ax-->>UI: Reject Promise
    end
```

---

## 4. Database Context Switching (Testing vs. Production)

To bypass internet latency and connection timeout issues during automated verification sprints:
- **Production/Local Dev:** Standard database queries go directly to the PostgreSQL database hosted on Neon.
- **Testing (`python manage.py test`):** A custom settings hook detects the test script args and switches the default database engine to `django.db.backends.sqlite3` on a local file block, avoiding any outbound cloud connections.

```python
import sys
if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
```
This is fully compliant with modern developer practices for serverless backend engines.
