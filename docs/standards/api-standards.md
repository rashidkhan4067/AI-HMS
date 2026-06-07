# API Development Standards & Best Practices

---
**Metadata**
- **Document Version:** 1.0 (Milestone 1 Completed)
- **Target Audience:** Backend Engineers, Integration Partners, QA Leads
- **Status:** APPROVED
---

## 1. Request and Response Protocols

- **Content Encoding:** All API communication payloads (both requests and responses) must use **JSON**.
- **Case Conventions:** Keys in request/response JSON bodies must follow strict `snake_case` notation. Header parameters must use `Kebab-Case`.
- **Date/Time Formats:** All dates and timestamps must conform to the ISO 8601 extended standard (`YYYY-MM-DDTHH:mm:ss.sssZ`) and must be normalized to Coordinated Universal Time (UTC).

---

## 2. API Versioning Policy

- **URL Path Versioning:** All endpoints must be version-prefixed using their major version identifier:
  - Base URL schema: `/api/v1/`
- **Breaking Changes:** Any change that drops keys, alters return datatypes, changes validation rules, or shifts authentication scopes requires a major version increment (e.g., to `/api/v2/`).
- **Non-Breaking Changes:** Adding optional request fields or returning extra response properties is backward-compatible and does not trigger version increments.

---

## 3. REST HTTP Methods and Response Mappings

The system utilizes REST standards to align methods with operation behaviors:

| Method | Database Action | Success Code | Error Code | Description |
|:---|:---|:---:|:---:|:---|
| **GET** | Read / Retrieve | `200 OK` | `404 Not Found` | Fetches resources. Must be idempotent and safe. |
| **POST** | Create / Write | `201 Created` | `400 Bad Request` | Creates new database records. Non-idempotent. |
| **PUT** | Update / Replace | `200 OK` | `400 Bad Request` | Overwrites an existing resource entirely. Idempotent. |
| **PATCH** | Update / Modify | `200 OK` | `400 Bad Request` | Performs partial updates on a resource. |
| **DELETE** | Destroy / Remove | `204 No Content` | `404 Not Found` | Deletes a resource. Idempotent. |

---

## 4. Standardized JSON Error Schemas

To simplify client integration, all API errors must return a predictable envelope:

### 4.1 Field-Specific Validation Errors (400 Bad Request)
```json
{
  "error_type": "VALIDATION_ERROR",
  "detail": "One or more properties failed model validation check.",
  "fields": {
    "email": ["User with this email already exists."],
    "role": ["Only Patients can register publicly."]
  }
}
```

### 4.2 Global System Errors (401, 403, 404, 500)
```json
{
  "error_type": "PERMISSION_DENIED",
  "detail": "You do not have permission to access the requested resource."
}
```

---

## 5. Pagination and Filtering Standards

- **Pagination:** All listing endpoints (e.g., query patients) must support parameter-based pagination:
  - Query fields: `?page=2&page_size=20`
  - Response metadata envelope:
    ```json
    {
      "count": 142,
      "next": "http://localhost:8000/api/v1/patients/?page=3",
      "previous": "http://localhost:8000/api/v1/patients/?page=1",
      "results": [...]
    }
    ```
- **Sorting:** Endpoint sorting must be handled via a single uniform `ordering` query parameter:
  - Ascending: `?ordering=last_name`
  - Descending: `?ordering=-date_joined`
