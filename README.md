# JobTrack — Job Application Tracker

[![CI Pipeline](https://github.com/user/jobtrack/actions/workflows/ci.yml/badge.svg)](https://github.com/user/jobtrack/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-emerald.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

**JobTrack** is a production-grade full-stack Web Application for managing your complete job search lifecycle:

> **Find Job → Save → Apply → Recruiter Response → Interviews → Offer / Rejection**

Built with **React (Vite) + FastAPI + PostgreSQL**, JobTrack features a visual Kanban pipeline board, real-time dashboard analytics with Recharts, interactive timeline history, interview round management, and JWT-authenticated security.

---

## ⚡ Key Features

- 🔐 **Authentication**: User registration, JWT token login, password hashing with bcrypt, protected routing.
- ☀️/🌙 **Light & Dark Theme**: 1-click theme toggle (persisted in `localStorage`) with custom CSS variables across buttons, cards, fonts, and charts.
- 📱 **Mobile Compatible UI**: Fully responsive sidebar drawer with hamburger menu, touch-friendly controls, and dynamic layouts for mobile, tablet, and desktop screens.
- 💼 **Application CRUD**: Full tracking with company, title, location, work mode, salary range, priority, source, notes, and resume versions.
- 📊 **Dashboard & Analytics**: Real-time stats, response rates, interview conversion percentages, area charts, donut distributions, bar charts, and performance radar charts.
- 🗂️ **Visual Kanban Pipeline**: Drag-and-drop job cards across stage columns (`Saved`, `Applied`, `Screening`, `Interview`, `Offer`, `Rejected`).
- 📅 **Interview Management**: Track multiple rounds (`HR`, `Technical`, `Managerial`, `System Design`, `Final`), meeting links, interviewers, and pass/fail results.
- 🕐 **Activity Audit History**: Automatic event logs tracking every status transition and interview update.
- 🔍 **Search, Filter & Sort**: Server-side capable multi-field search, status/priority filtering, and pagination.
- 📑 **Resume Version Tracking**: Associate specific resume iterations (`React-v3.pdf`, `Fullstack-v2.pdf`) with each application.
- 🐳 **Docker & CI/CD**: Fully containerized stack with `docker-compose` and GitHub Actions CI workflow.

---

## 🏗️ Architecture & Tech Stack

```text
  React 18 (Vite)
       │ HTTP / REST
       ▼
   FastAPI API
       │ SQLAlchemy ORM
       ▼
 PostgreSQL 16 DB
```

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Recharts, `@dnd-kit`, Lucide Icons |
| **Styling** | Vanilla CSS Tokens (Glassmorphic Dark Theme) |
| **Backend** | FastAPI, Python 3.12, Pydantic v2, Passlib (Bcrypt), PyJWT |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0 ORM |
| **Testing** | Pytest + FastAPI TestClient (Backend), Vitest (Frontend) |
| **DevOps** | Docker, Docker Compose, Nginx, GitHub Actions |

Detailed architecture guides are available in [`docs/architecture.md`](docs/architecture.md).

---

## 🚀 Quick Start (Local Setup)

### Option 1: Using Docker Compose (Recommended)

Run the entire application (Frontend + Backend + PostgreSQL) with a single command:

```bash
git clone https://github.com/your-username/jobtrack.git
cd jobtrack

docker compose up --build
```

- **Frontend Application**: `http://localhost`
- **FastAPI REST API**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

---

### Option 2: Running Locally (Development Mode)

#### 1. Start FastAPI Backend

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Backend will start at `http://localhost:8000`.

#### 2. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at `http://localhost:5173`.

---

## 🧪 Running Tests

### Backend Tests (Pytest)

```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Build Verification

```bash
cd frontend
npm run build
```

---

## 📖 Documentation Links

- 🏛️ [System Architecture](docs/architecture.md)
- 🗄️ [Database Schema & ERD](docs/database.md)
- 🔌 [API Documentation](docs/api.md)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
