# JobTrack — API Specification

The JobTrack REST API is implemented with FastAPI and documented automatically via OpenAPI (Swagger).

- **Base URL**: `http://localhost:8000/api`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## Authentication Endpoints

### `POST /api/auth/register`
Create a new user account.

- **Request Body**:
```json
{
  "name": "Aishwarya R",
  "email": "aishwarya@example.com",
  "password": "securepassword123"
}
```
- **Response** `201 Created`:
```json
{
  "id": "c1f7a8e2-...",
  "name": "Aishwarya R",
  "email": "aishwarya@example.com",
  "created_at": "2026-08-19T20:00:00Z"
}
```

### `POST /api/auth/login`
Authenticate credentials and receive a JWT access token.

- **Request Form Body**: `username=aishwarya@example.com&password=securepassword123`
- **Response** `200 OK`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer"
}
```

### `GET /api/auth/me`
Retrieve profile of currently authenticated user.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

## Application Endpoints

### `GET /api/applications`
Retrieve paginated, filtered, and sorted application list.

- **Query Parameters**:
  - `status`: `SAVED` | `APPLIED` | `SCREENING` | `INTERVIEW` | `OFFER` | `REJECTED` | `WITHDRAWN`
  - `priority`: `LOW` | `MEDIUM` | `HIGH`
  - `work_mode`: `REMOTE` | `HYBRID` | `ONSITE`
  - `search`: Search query string
  - `sort_by`: `application_date` | `company` | `job_title` | `priority` | `updated_at` (default: `application_date`)
  - `order`: `asc` | `desc` (default: `desc`)
  - `page`: Integer page (default: `1`)
  - `limit`: Items per page (default: `20`)

### `POST /api/applications`
Create a new job application.

### `GET /api/applications/{id}`
Retrieve detailed application record.

### `PATCH /api/applications/{id}`
Update application fields or state. Automatically logs an activity timeline entry when `status` changes.

### `DELETE /api/applications/{id}`
Delete application and associated interviews/activities.

---

## Interview Endpoints

### `GET /api/applications/{app_id}/interviews`
List all interviews scheduled for an application.

### `POST /api/applications/{app_id}/interviews`
Schedule a new interview round.

### `PATCH /api/interviews/{id}`
Update interview result or notes.

---

## Dashboard Endpoints

### `GET /api/dashboard/summary`
Retrieve real-time job search performance metrics (response rate, interview rate, counts by status).
