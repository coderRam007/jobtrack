# JobTrack — Database Schema & ERD

JobTrack uses PostgreSQL 16 relational database structure with strict foreign key constraints and cascade deletions.

## Entity Relationship Diagram (ERD)

```text
┌──────────────────────┐        1 : N        ┌──────────────────────────┐
│        users         ├────────────────────►│       applications       │
├──────────────────────┤                     ├──────────────────────────┤
│ id (PK)              │                     │ id (PK)                  │
│ name                 │                     │ user_id (FK -> users.id) │
│ email (UNIQUE, INDEX)│                     │ company (INDEX)          │
│ password_hash        │                     │ job_title (INDEX)        │
│ created_at           │                     │ location                 │
│ updated_at           │                     │ work_mode (ENUM)         │
└──────────┬───────────┘                     │ salary_min, salary_max   │
           │                                 │ status (ENUM, INDEX)     │
           │ 1 : N                           │ priority (ENUM)          │
           ▼                                 │ source                   │
┌──────────────────────┐                     │ application_date         │
│   resume_versions    │                     │ created_at, updated_at   │
├──────────────────────┤                     └──────────┬───────────────┘
│ id (PK)              │                                │
│ user_id (FK)         │               ┌────────────────┼────────────────┐
│ name, version        │               │ 1 : N          │ 1 : N          │ 1 : N
│ file_reference       │               ▼                ▼                ▼
└──────────────────────┘     ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
                             │   interviews   │ │  activities  │ │    notes     │
                             ├────────────────┤ ├──────────────┤ ├──────────────┤
                             │ id (PK)        │ │ id (PK)      │ │ id (PK)      │
                             │ application_id │ │ app_id (FK)  │ │ app_id (FK)  │
                             │ round, type    │ │ activity_type│ │ content      │
                             │ scheduled_at   │ │ description  │ │ created_at   │
                             │ interviewer    │ │ created_at   │ │ updated_at   │
                             │ meeting_url    │ └──────────────┘ └──────────────┘
                             │ result (ENUM)  │
                             └────────────────┘
```

---

## Table Definitions

### 1. `users`
Stores user profile credentials and metadata.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID string |
| `name` | VARCHAR | NOT NULL | User full name |
| `email` | VARCHAR | UNIQUE, INDEX, NOT NULL | Account email |
| `password_hash` | VARCHAR | NOT NULL | Bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration timestamp |

---

### 2. `applications`
Primary application entity containing details, status, priority, and source.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID string |
| `user_id` | VARCHAR(36) | FK -> users.id ON DELETE CASCADE | Owner |
| `company` | VARCHAR | INDEX, NOT NULL | Company name |
| `job_title` | VARCHAR | INDEX, NOT NULL | Role title |
| `location` | VARCHAR | NOT NULL | Job location |
| `work_mode` | ENUM | REMOTE / HYBRID / ONSITE | Work arrangement |
| `status` | ENUM | SAVED / APPLIED / SCREENING / INTERVIEW / OFFER / REJECTED / WITHDRAWN | Current state |
| `priority` | ENUM | LOW / MEDIUM / HIGH | Priority rating |
| `salary_min` | FLOAT | NULLABLE | Salary lower bound |
| `salary_max` | FLOAT | NULLABLE | Salary upper bound |
| `application_date` | VARCHAR | NOT NULL | YYYY-MM-DD date string |

---

### 3. `interviews`
Tracks round-by-round interview schedules, interviewers, and outcomes.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID string |
| `application_id` | VARCHAR(36) | FK -> applications.id ON DELETE CASCADE | Parent application |
| `round` | INTEGER | NOT NULL | Round number (1, 2, 3...) |
| `type` | ENUM | HR / TECHNICAL / MANAGERIAL / SYSTEM_DESIGN / FINAL / OTHER | Round type |
| `scheduled_at` | TIMESTAMP | NOT NULL | ISO datetime |
| `result` | ENUM | PENDING / PASSED / FAILED | Round status |

---

### 4. `activities`
Audit timeline recording status shifts, application creation, and interview scheduling.

---

### 5. `resume_versions`
User resume version references attached to individual applications.
