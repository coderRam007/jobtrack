# JobTrack — System Architecture

JobTrack is engineered as a clean, modular full-stack application designed for maximum developer ergonomics, testability, and enterprise deployment standards.

```
┌─────────────────────────────────────────────────────────────┐
│                   Browser / Client (React 18)               │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / REST (Axios)          │ JSON Response
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                    FastAPI Backend (Python 3.12)            │
│  - JWT Bearer Authentication                                │
│  - Pydantic Request/Response Validation                     │
│  - SQLAlchemy ORM Data Access Layer                         │
└──────────────┬──────────────────────────────▲───────────────┘
               │ SQL Queries                  │ Result Sets
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                  PostgreSQL 16 Database                     │
│  - Relational Schema with Foreign Key Constraints           │
│  - Indexed Status, Company, Job Title & User References     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Architecture (`frontend/`)

- **Framework**: React 18 with Vite for lightning-fast HMR and optimized production builds.
- **Styling**: Vanilla CSS custom properties (design tokens) creating a modern glassmorphic dark theme.
- **State & Context**:
  - `AuthContext`: Handles authentication state, JWT storage in `localStorage`, auto-refreshing sessions.
- **Routing**: `react-router-dom` with route guards enforcing authentication for private pages (`/dashboard`, `/applications`, `/kanban`, `/interviews`, `/analytics`, `/profile`).
- **Charts**: `recharts` for interactive Area, Donut, Bar, Line, and Radar visualization charts.
- **Drag and Drop**: `@dnd-kit/core` & `@dnd-kit/sortable` powers the visual Kanban pipeline.

---

## 2. Backend Architecture (`backend/`)

- **Framework**: FastAPI (Python 3.12) delivering async request processing and automatic Swagger UI docs.
- **Security & Authentication**:
  - Passlib with `bcrypt` for password hashing before database persistence.
  - PyJWT (`python-jose`) for issuing signed access tokens (`HS256`).
  - OAuth2 Password Bearer dependency injecting `current_user` into protected routes.
- **ORM & Database**:
  - SQLAlchemy 2.0 declarative base mapping.
  - SQLite fallback for seamless zero-config local development, PostgreSQL for production.
- **Validation**: Pydantic v2 schemas validating incoming body payloads and outgoing response structures.

---

## 3. Deployment & Containerization

- **Docker Compose**: Single `docker-compose up` command orchestrates `frontend` (Nginx), `backend` (FastAPI/Uvicorn), and `postgres` (PostgreSQL 16) containers.
- **CI/CD**: GitHub Actions pipeline triggering automated Pytest backend suites, Vite frontend builds, and Docker build validations on every push.
