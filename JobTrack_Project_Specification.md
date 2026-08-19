# JobTrack — Job Application Tracker

## 1. Project Goal

Build a production-style **Job Application Tracker** that helps a user manage the complete job-search lifecycle:

> Find job → Save → Apply → Recruiter response → Interviews → Offer / Rejection

The project should demonstrate practical **React + FastAPI + PostgreSQL** development, clean API design, authentication, database relationships, testing, Docker, CI/CD, and deployment.

The goal is **not** to build the largest possible application. The goal is to build a polished project that is easy to demonstrate in interviews and strong enough to showcase on GitHub.

---

# 2. Recommended Tech Stack

| Area | Tool / Technology | Purpose |
|---|---|---|
| Frontend | React | Web application UI |
| Frontend routing | React Router | Page navigation |
| Styling | CSS / Tailwind CSS | UI styling |
| Backend | FastAPI | REST API |
| Language | Python | Backend development |
| Database | PostgreSQL | Persistent relational data |
| ORM | SQLAlchemy | Database interaction |
| Validation | Pydantic | Request/response validation |
| Authentication | JWT | User authentication |
| Password security | Passlib / bcrypt or Argon2 | Password hashing |
| API documentation | FastAPI Swagger/OpenAPI | API documentation |
| Testing frontend | Vitest + React Testing Library | React tests |
| Testing backend | Pytest | API/business-logic tests |
| Containers | Docker | Application containerization |
| Local orchestration | Docker Compose | Run frontend/backend/database |
| Version control | Git + GitHub | Source control |
| CI/CD | GitHub Actions | Automated tests/builds |
| Deployment | Render / Railway / AWS / GCP | Hosting |
| API testing | Postman or Bruno | Manual API testing |
| Database inspection | pgAdmin / DBeaver | PostgreSQL management |
| UI design | Figma (optional) | Wireframes and layout planning |

---

# 3. Core User Flow

The application should support this workflow:

```text
                    ┌──────────────┐
                    │   Job Found  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │     Saved    │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │    Applied   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Screening  │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Interview  │
                    └──────┬───────┘
                           ↓
                 ┌─────────┴─────────┐
                 ↓                   ↓
           ┌──────────┐        ┌──────────┐
           │  Offer   │        │ Rejected │
           └──────────┘        └──────────┘
```

A user should be able to see this pipeline visually.

---

# 4. Feature Scope

## Phase 1 — Authentication

Implement:

- User registration
- Login
- Logout
- Password hashing
- JWT authentication
- Protected routes
- Current-user endpoint
- Basic profile page

Example API:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Important

Never store plain-text passwords.

Passwords must be hashed before being stored in PostgreSQL.

---

# 5. Job Application Management

Users should be able to:

- Create a job application
- View applications
- Edit applications
- Delete applications
- View application details
- Change application status

Each application should support fields such as:

```text
Company
Job title
Location
Work mode
Salary range
Job URL
Job description
Application date
Status
Priority
Notes
Source
Created date
Updated date
```

Possible status values:

```text
SAVED
APPLIED
SCREENING
INTERVIEW
OFFER
REJECTED
WITHDRAWN
```

Possible priority:

```text
LOW
MEDIUM
HIGH
```

---

# 6. Dashboard

Create a useful dashboard instead of just displaying a list.

Show:

- Total applications
- Applications this week
- Applications this month
- Active applications
- Interviews scheduled
- Offers
- Rejections
- Response rate
- Interview conversion rate

Example:

```text
Applications       47
Responses          12
Interviews          7
Final Rounds        2
Offers              1

Response Rate     25.5%
Interview Rate    14.9%
```

Add charts for:

- Applications by status
- Applications over time
- Applications by source
- Applications by location

Recommended frontend chart library:

**Recharts**

---

# 7. Kanban Application Pipeline

Create a visual Kanban board.

Columns:

```text
Saved
Applied
Screening
Interview
Offer
Rejected
```

A user should be able to move an application between statuses.

For the first version, clicking a status/change control is enough.

Optional advanced feature:

- Drag-and-drop applications between columns.

Recommended tool:

**dnd-kit**

Do not make drag-and-drop the first feature you implement. Build normal status updates first.

---

# 8. Interview Management

An application can have multiple interviews.

For each interview store:

```text
Application
Interview round
Interview type
Date/time
Interviewer
Meeting link
Notes
Result
```

Example:

```text
Company: ABC Technologies
Role: React Developer

Round 1
Technical Screening
Aug 25, 2026
Result: Passed

Round 2
Technical Interview
Aug 28, 2026
Result: Pending

Round 3
Managerial
Sep 02, 2026
Result: Pending
```

Possible interview types:

```text
HR
Technical
Managerial
System Design
Final
Other
```

---

# 9. Activity Timeline

Track important events.

Example:

```text
Aug 19
Application created

Aug 20
Status changed: Saved → Applied

Aug 22
Recruiter contacted

Aug 23
Interview scheduled

Aug 27
Technical interview completed
```

This requires an activity/audit table in the database.

This is a particularly useful feature to discuss in interviews because it demonstrates event/history tracking.

---

# 10. Search, Filtering and Sorting

The application list should support:

### Search

Search by:

- Company
- Job title
- Location

### Filters

Filter by:

- Status
- Priority
- Work mode
- Source
- Date range

### Sorting

Sort by:

- Application date
- Company
- Job title
- Priority
- Last updated

Do filtering and pagination on the **backend**, not only in React.

Example:

```text
GET /api/applications?
status=INTERVIEW
&page=1
&limit=20
&sort_by=application_date
&order=desc
```

---

# 11. Resume Version Tracking

Allow the user to record which resume was used for an application.

For example:

```text
Application:
Google — Frontend Developer

Resume:
resume-react-v3.pdf

Version:
React-focused v3
```

You do not need to build a full document-management system.

A simple version/name/reference is enough for the first version.

Optional later feature:

- Upload resume files.

---

# 12. Notes

Each application should support notes.

Examples:

```text
Recruiter name
Expected salary
Questions asked
Technology stack
Things to prepare
Follow-up information
```

Notes should be editable.

---

# 13. Database Design

Use PostgreSQL.

Suggested tables:

```text
users
  │
  ├── applications
  │       │
  │       ├── interviews
  │       ├── notes
  │       └── activities
  │
  └── resume_versions
```

Possible detailed structure:

```text
users
├── id
├── name
├── email
├── password_hash
├── created_at
└── updated_at

applications
├── id
├── user_id
├── company
├── job_title
├── location
├── work_mode
├── salary_min
├── salary_max
├── job_url
├── description
├── status
├── priority
├── source
├── application_date
├── created_at
└── updated_at

interviews
├── id
├── application_id
├── round
├── type
├── scheduled_at
├── interviewer
├── meeting_url
├── notes
├── result
└── created_at

activities
├── id
├── application_id
├── activity_type
├── description
├── created_at
└── created_by

notes
├── id
├── application_id
├── content
├── created_at
└── updated_at

resume_versions
├── id
├── user_id
├── name
├── version
├── file_reference
├── created_at
└── updated_at
```

Use foreign keys and appropriate indexes.

---

# 14. Backend Architecture

Use a clean FastAPI structure.

Suggested structure:

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── applications.py
│   │   ├── interviews.py
│   │   ├── dashboard.py
│   │   └── users.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── application.py
│   │   ├── interview.py
│   │   ├── activity.py
│   │   └── note.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── application.py
│   │   └── interview.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── application_service.py
│   │   └── dashboard_service.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   │
│   └── tests/
│
├── alembic/
├── requirements.txt
└── Dockerfile
```

Use **Alembic** for database migrations.

---

# 15. Frontend Architecture

Suggested structure:

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── ApplicationCard/
│   │   ├── ApplicationForm/
│   │   ├── StatusBadge/
│   │   └── Modal/
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Applications/
│   │   ├── ApplicationDetails/
│   │   ├── Interviews/
│   │   └── Profile/
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

Do not put all application logic into `App.jsx`.

---

# 16. API Design

Use RESTful APIs.

Example:

```text
Authentication
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Applications
GET    /api/applications
POST   /api/applications
GET    /api/applications/{id}
PATCH  /api/applications/{id}
DELETE /api/applications/{id}

Interviews
GET    /api/applications/{id}/interviews
POST   /api/applications/{id}/interviews
PATCH  /api/interviews/{id}
DELETE /api/interviews/{id}

Activities
GET    /api/applications/{id}/activities

Dashboard
GET    /api/dashboard/summary
GET    /api/dashboard/statistics
```

Use appropriate HTTP status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

---

# 17. Error Handling

Create consistent API errors.

Example:

```json
{
  "success": false,
  "message": "Application not found",
  "error_code": "APPLICATION_NOT_FOUND"
}
```

The frontend should display useful messages instead of silently failing.

Handle:

- Network failures
- Authentication expiration
- Validation errors
- Server errors
- Not-found errors

---

# 18. Testing

## Backend

Use:

**Pytest + FastAPI TestClient**

Test:

- Registration
- Login
- Invalid credentials
- Protected endpoints
- Create application
- Update application
- Delete application
- Filtering
- Pagination
- Interview creation
- Authorization

## Frontend

Use:

**Vitest + React Testing Library**

Test important behavior:

- Login form
- Application form
- Application list
- Filtering
- Status changes
- Protected routes
- Error states

Do not try to achieve 100% coverage.

Focus on important business logic.

---

# 19. Docker

The entire application should run with:

```bash
docker compose up
```

Services:

```text
frontend
backend
postgres
```

Optional:

```text
nginx
```

Example:

```text
Browser
   ↓
Frontend container
   ↓
Backend container
   ↓
PostgreSQL container
```

Use environment variables for:

```text
DATABASE_URL
JWT_SECRET
API_URL
```

Never commit secrets to GitHub.

---

# 20. GitHub Actions

Create a CI pipeline.

On every push/pull request:

```text
GitHub Push
    ↓
Install dependencies
    ↓
Run backend tests
    ↓
Run frontend tests
    ↓
Build frontend
    ↓
Build Docker image
```

A failed test should cause the workflow to fail.

---

# 21. Deployment

Deploy a working public version.

Possible options:

### Simple

- Frontend → Vercel
- Backend → Render/Railway
- PostgreSQL → managed PostgreSQL

### More advanced

Deploy using AWS/GCP.

For a portfolio project, **working deployment matters more than using an unnecessarily complicated cloud architecture**.

---

# 22. UI Pages

Minimum pages:

```text
/login
/register
/dashboard
/applications
/applications/:id
/interviews
/profile
```

Recommended layout:

```text
┌─────────────────────────────────────────────┐
│ Navbar                                      │
├─────────────┬───────────────────────────────┤
│             │                               │
│ Dashboard   │                               │
│ Applications│       Main Content            │
│ Interviews  │                               │
│ Analytics   │                               │
│ Profile     │                               │
│             │                               │
└─────────────┴───────────────────────────────┘
```

Make the UI responsive.

---

# 23. Optional Features

Only add these after the core application is stable.

### Email reminders

Send reminders for:

- Upcoming interview
- Follow-up after application
- Interview preparation

Tool:

**Resend / SendGrid**

### Calendar integration

Optional Google Calendar integration.

### File uploads

Upload:

- Resume
- Cover letter
- Offer letter

Possible storage:

- Cloudinary
- AWS S3
- Cloudflare R2

### Drag-and-drop Kanban

Use:

**dnd-kit**

### Dark mode

Optional.

---

# 24. Features NOT to Build Initially

Avoid scope creep.

Do not start with:

- AI
- Chatbot
- Web scraping
- LinkedIn automation
- Automatic job applications
- Complex microservices
- Kubernetes
- Real-time WebSockets
- Mobile application

The first version should be a **well-engineered monolith**.

---

# 25. GitHub Repository

Repository name:

```text
jobtrack
```

Suggested structure:

```text
jobtrack/
│
├── frontend/
├── backend/
├── docs/
│   ├── architecture.md
│   ├── database.md
│   └── api.md
│
├── screenshots/
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── README.md
├── .gitignore
└── LICENSE
```

---

# 26. README Requirements

The README should contain:

## Project Overview

What JobTrack is and why it exists.

## Features

List the major functionality.

## Screenshots

Include:

- Login
- Dashboard
- Applications
- Kanban board
- Application details
- Interview page
- Analytics

## Architecture

Show:

```text
React
  ↓
FastAPI
  ↓
PostgreSQL
```

## Tech Stack

Clearly list all technologies.

## Local Setup

Explain:

```bash
git clone ...
cd jobtrack
docker compose up
```

## API Documentation

Link to the deployed Swagger documentation.

## Testing

Explain how to run tests.

## Deployment

Provide the live application URL.

## Future Improvements

List features that are intentionally outside the current scope.

---

# 27. Git Commit Strategy

Do not make one giant commit at the end.

Use meaningful commits.

Examples:

```text
feat: initialize React application
feat: initialize FastAPI backend
feat: add PostgreSQL database configuration
feat: implement user registration
feat: implement JWT authentication
feat: add application CRUD APIs
feat: add application dashboard
feat: add application filtering
feat: add interview management
feat: add activity timeline
test: add application API tests
test: add authentication tests
build: add Docker configuration
ci: add GitHub Actions pipeline
docs: add project architecture
```

This makes your GitHub history itself demonstrate your development process.

---

# 28. Definition of Done

The project should not be considered complete until:

- [ ] User can register
- [ ] User can log in
- [ ] Authentication protects private pages
- [ ] User can create applications
- [ ] User can edit applications
- [ ] User can delete applications
- [ ] User can change application status
- [ ] Applications have search/filter/sort
- [ ] Applications support pagination
- [ ] Dashboard displays useful statistics
- [ ] Kanban pipeline works
- [ ] Interviews can be created and managed
- [ ] Activity history is recorded
- [ ] PostgreSQL is used properly
- [ ] Backend has tests
- [ ] Frontend has important component tests
- [ ] Docker Compose runs the application
- [ ] GitHub Actions runs automatically
- [ ] Application is deployed
- [ ] README is complete
- [ ] Screenshots are included
- [ ] Architecture documentation is included
- [ ] No secrets are committed
- [ ] Project can be demonstrated end-to-end

---

# 29. Priority Order

If time becomes limited, build in this order:

### Must Have

1. Authentication
2. Application CRUD
3. PostgreSQL
4. Dashboard
5. Search/filter
6. Status pipeline
7. Interview management
8. Docker
9. Tests
10. Deployment

### Should Have

11. Activity timeline
12. Pagination
13. Resume version tracking
14. Analytics
15. GitHub Actions

### Nice to Have

16. Drag-and-drop Kanban
17. Email reminders
18. File uploads
19. Calendar integration
20. Dark mode

---

# 30. Final Target

The finished project should feel like a small real-world SaaS application rather than a tutorial project.

A recruiter should be able to:

1. Open the GitHub repository.
2. Understand the project within 30 seconds.
3. See screenshots.
4. Open the live application.
5. Register/login.
6. Create a job application.
7. Move it through the pipeline.
8. Schedule an interview.
9. View dashboard statistics.
10. Open the Swagger API documentation.
11. See tests and CI/CD.
12. Understand the architecture.

That is the standard to aim for.
